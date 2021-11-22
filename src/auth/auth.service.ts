import {BadRequestException, HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {Repository} from "typeorm";
import {CreateUserDto} from "./input/create.user.dto";
import * as bcrypt from "bcrypt";

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
            throw new HttpException({
                status,
                error,
                message: errors
            }, status)
        }

        return await this.userRepository.save({
            ...input,
            password: await this.hashPassword(input.password)
        });
    }

    public getTokenForUser(user: User): string {
        return this.jwtService.sign({
            username: user.email,
            sub: user.id
        });
    }

    public async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }
}