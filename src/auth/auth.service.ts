import {HttpException, HttpStatus, Injectable, UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {Repository} from "typeorm";
import {CreateUserDto} from "./input/create.user.dto";
import * as bcrypt from "bcrypt";
import {TokenEntityDto, TokenType} from "./output/token.entity.dto";
import {RefreshTokenDto} from "./input/refresh.token.dto";
import {HttpErrorCodes} from "../api/api.http";
import {v4 as uuidv4} from 'uuid';
import {Profile} from "../profile/profile.entity";
import {Settings} from "../profile/settings.entity";

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>,
        private readonly jwtService: JwtService
    ) {}

    public async createUser(input: CreateUserDto): Promise<User> {
        let errors: Array<string> = [];
        let status = HttpStatus.UNPROCESSABLE_ENTITY;
        let error = HttpErrorCodes.UNPROCESSABLE_ENTITY;

        // Check the "retype password" field
        if (input.password !== input.retypedPassword) {
            errors.push('Passwords are not identical');
        }

        // Check the username and email are unique
        const existingUser = await this.userRepository.findOne({email: input.email});
        if (existingUser) {
            errors.push('This email is already registered');
            status = HttpStatus.CONFLICT;
            error = HttpErrorCodes.CONFLICT;
        }

        // Check the gender value
        if (input.gender === undefined) {
            errors.push('Param "gender" is required');
        }

        // If there is some errors - throw an 400 error
        if (errors.length > 0) {
            throw new HttpException({status, error, message: errors}, status);
        }

        // Generate user uuid
        if (input.id === undefined) {
            input.id = uuidv4();
        }

        const {id, ...partial} = input;
        const userParams = {
            ...partial,
            uuid: id,
            password: await hashPassword(input.password)
        }

        // Create a user account
        const user = await this.userRepository.save(userParams);
        // Create user's profile
        await this.createProfile(user, input);
        // Create user's settings
        await this.createSettings(user, input);

        return user;
    }

    public getTokenForUser(user: User): TokenEntityDto {
        const payload = {username: user.email, sub: user.id};
        const timestamp = Date.now();

        return new TokenEntityDto(
            this.jwtService.sign({
                ...payload,
                signature: TokenType.ACCESS_TOKEN + ':' + timestamp},
                {expiresIn: process.env.AUTH_TOKEN_LIFETIME}
            ),
            this.jwtService.sign({
                ...payload,
                signature: TokenType.REFRESH_TOKEN + ':' + timestamp},
                {expiresIn: process.env.REFRESH_TOKEN_LIFETIME}
            )
        );
    }

    public async refreshUserToken(input: RefreshTokenDto): Promise<User> {
        // Parse access and refresh tokens
        const accessToken = this.jwtService.decode(input.accessToken);
        const refreshToken = this.jwtService.decode(input.refreshToken);
        if (!accessToken || !refreshToken) {
            throw new UnauthorizedException(HttpErrorCodes.INVALID_TOKEN);
        }

        // Check the tokens required fields
        const requiredFields = ['username', 'sub', 'signature', 'exp'];
        requiredFields.forEach((field) => {
            if (accessToken[field] === undefined || refreshToken[field] === undefined) {
                throw new UnauthorizedException(HttpErrorCodes.INVALID_TOKEN);
            }
        });

        // Check refresh token expired at
        if (refreshToken['exp'] <= Date.now() / 1000) {
            throw new UnauthorizedException(HttpErrorCodes.EXPIRED_TOKEN);
        }

        // Compare fields that should be equal to both tokens
        const equalFields = ['username', 'sub'];
        equalFields.forEach((field) => {
            if (accessToken[field] !== refreshToken[field]) {
                throw new UnauthorizedException(HttpErrorCodes.UNAUTHORIZED);
            }
        });

        // Compare tokens signatures
        if (AuthService.parseTokenSignature(accessToken['signature'], TokenType.ACCESS_TOKEN) !==
            AuthService.parseTokenSignature(refreshToken['signature'], TokenType.REFRESH_TOKEN)
        ) {
            throw new UnauthorizedException(HttpErrorCodes.INVALID_TOKEN);
        }

        // Find and return user found by ID
        return await this.userRepository.findOne(accessToken.sub);
    }

    public async getUserByUsername(username: string): Promise<User|null> {
        const user = await this.userRepository.findOne({email: username});
        return user ?? null;
    }

    private static parseTokenSignature(signature: string, tokenType: TokenType): string {
        const re = new RegExp(`${tokenType}:(.+)`);
        const matches = signature.match(re);
        if (!matches || matches[1] === undefined) {
            throw new UnauthorizedException(HttpErrorCodes.INVALID_TOKEN);
        }
        return matches[1];
    }

    private async createProfile(user: User, input: CreateUserDto): Promise<Profile>
    {
        return await this.profileRepository.save({
            user: user,
            ...input
        });
    }

    private async createSettings(user: User, input: CreateUserDto): Promise<Profile>
    {
        return await this.settingsRepository.save({
            user: user,
            ...input
        });
    }
}