import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {Repository} from "typeorm";
import {CreateUserDto} from "./input/create.user.dto";
import * as bcrypt from "bcrypt";
import {TokenEntityDto, TokenType} from "./output/token.entity.dto";

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
}

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    public async createUser(input: CreateUserDto): Promise<User> {
        let errors: Array<string> = [];
        let status = HttpStatus.UNPROCESSABLE_ENTITY;
        let error = 'Unprocessable entity';

        // Check the "retype password" field
        if (input.password !== input.retypedPassword) {
            errors.push('Passwords are not identical');
        }

        // Check the username and email are unique
        const existingUser = await this.userRepository.findOne({email: input.email});
        if (existingUser) {
            errors.push('This email is already registered');
            status = HttpStatus.CONFLICT;
            error = 'Conflict';
        }

        // If there is some errors - throw an 400 error
        if (errors.length > 0) {
            throw new HttpException({status, error, message: errors}, status);
        }

        return await this.userRepository.save({
            ...input,
            password: await hashPassword(input.password)
        });
    }

    public getTokenForUser(user: User): TokenEntityDto {
        const payload = {username: user.email, sub: user.id};
        const timestamp = Date.now();

        return new TokenEntityDto(
            this.jwtService.sign({...payload, signature: TokenType.ACCESS_TOKEN + ':' + timestamp}),
            this.jwtService.sign({...payload, signature: TokenType.REFRESH_TOKEN + ':' + timestamp})
        );
    }
}