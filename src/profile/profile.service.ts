import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../auth/user.entity";
import {Repository} from "typeorm";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {UpdateProfileDto} from "./input/update.profile.dto";
import {hashPassword} from "../auth/auth.service";
import {DeleteResult} from "typeorm/query-builder/result/DeleteResult";
import {HttpErrorCodes} from "../api/api.http";
import {FileSystemService} from "../service/fileSystem.service";
import {Photo} from "./photo.entity";
import {SelectQueryBuilder} from "typeorm/query-builder/SelectQueryBuilder";

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>,
        private readonly fileSystem: FileSystemService
    ) {}

    public async findByUuid(uuid: string): Promise<User> {
        const user = await this.userRepository.findOne({uuid});
        user.setAvatar(await this.getAvatar(user));
        return user;
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
        // Save photo image file
        const photoFilePath = await this.fileSystem.saveUserPhoto(user, file);

        // Get user avatar
        const avatar = await this.getAvatar(user);

        // Create new "Photo" entity (transform file's path to relative path that can be used as a relative web-link)
        let photo = new Photo();
        photo.path = photoFilePath.replace('./', '/');
        photo.size = file.size;
        // If user has no avatar yet, set current photo as an avatar
        photo.isAvatar = avatar === undefined;

        // Add new photo to user's entity
        user.addPhoto(photo);
        // Save user (it will insert the new "photo" record in DB and join it to current user)
        await this.userRepository.save(user);
    }

    public async getAvatar(user: User): Promise<Photo> {
        return this.createPhotoBaseQuery(user).andWhere('isAvatar = 1').getOne();
    }

    private createPhotoBaseQuery(user: User): SelectQueryBuilder<Photo> {
        return this.photoRepository.createQueryBuilder('p')
            .where('p.userId = :userId', {userId: user.id});
    }
}