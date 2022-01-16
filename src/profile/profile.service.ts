import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../auth/user.entity";
import {Repository} from "typeorm";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {UpdateProfileDto} from "./input/update.profile.dto";
import {hashPassword} from "../auth/auth.service";
import {DeleteResult} from "typeorm/query-builder/result/DeleteResult";
import {HttpErrorCodes} from "../api/api.http";
import {FileSystemService} from "../service/fileSystem.service";

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly fileSystem: FileSystemService
    ) {}

    public async findByUuid(uuid: string): Promise<User> {
        return this.userRepository.findOne({uuid});
    }

    public async update(user: User, input: UpdateProfileDto): Promise<User> {
        let errors: Array<string> = [];
        let status = HttpStatus.UNPROCESSABLE_ENTITY;
        let error = HttpErrorCodes.UNPROCESSABLE_ENTITY;

        // Check the "retype password" field
        if (input.password) {
            if (input.password !== input.retypedPassword) {
                errors.push('Passwords are not identical');
            } else {
                input.password = await hashPassword(input.password);
                input.retypedPassword = undefined;
            }
        }

        // Check if "id" or "uud" field are defined
        if (input['id'] !== undefined) {
            errors.push('Filed "id" is closed for modifying');
        }
        if (input['uuid'] !== undefined) {
            status = HttpStatus.BAD_REQUEST
            error = HttpErrorCodes.BAD_REQUEST;
            errors.push(error);
        }

        // If there is some errors - throw an 400 error
        if (errors.length > 0) {
            throw new HttpException({status, error, message: errors}, status);
        }

        return this.userRepository.save(Object.assign(user, input));
    }

    public async delete(user: User): Promise<DeleteResult> {
        return this.userRepository.delete(user);
    }

    public async addPhoto(user: User, file: Express.Multer.File) {
        const photoFilePath = await this.fileSystem.saveUserPhoto(user, file);

        return photoFilePath.replace('./', '/');
    }
}