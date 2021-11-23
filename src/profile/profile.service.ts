import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../auth/user.entity";
import {Repository} from "typeorm";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {UpdateProfileDto} from "./input/update.profile.dto";
import {hashPassword} from "../auth/auth.service";

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    public async findOne(id: number): Promise<User> {
        return this.userRepository.findOne({id});
    }

    public async update(user: User, input: UpdateProfileDto): Promise<User> {
        let errors: Array<string> = [];
        let status = HttpStatus.UNPROCESSABLE_ENTITY;
        let error = 'Unprocessable entity';

        // Check the "retype password" field
        if (input.password) {
            if (input.password !== input.retypedPassword) {
                errors.push('Passwords are not identical');
            } else {
                input.password = await hashPassword(input.password);
                input.retypedPassword = undefined;
            }
        }

        // If there is some errors - throw an 400 error
        if (errors.length > 0) {
            throw new HttpException({status, error, message: errors}, status);
        }

        return this.userRepository.save(Object.assign(user, input));
    }
}