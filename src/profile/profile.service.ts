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
import {Profile} from "./profile.entity";
import {Settings} from "./settings.entity";
import {bytesToReadable} from "../helpers/string.helper";
import {inArray, removeByIndex} from "../helpers/array.helper";
import {base64ToFile} from "../helpers/file.helper";
import {throwError} from "rxjs";
import {UpdatePasswordDto} from "./input/update.password.dto";
import * as bcrypt from "bcrypt";

export enum UserInitializationItem {
    Settings,
    Profile,
    Photos
}

export interface ImageData {
    name: string,
    src: string,
    size: number,
    isAvatar?: boolean
}

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>,
        private readonly fileSystem: FileSystemService
    ) {}

    public async init(user: User, initItems: UserInitializationItem[] = []) {
        if ((initItems.length === 0 || inArray(UserInitializationItem.Profile, initItems)) && user.profile === undefined) {
            user.profile = await this.profileRepository.findOne({user});
        }
        if ((initItems.length === 0 || inArray(UserInitializationItem.Settings, initItems)) && user.settings === undefined) {
            user.settings = await this.settingsRepository.findOne({user});
        }
        if ((initItems.length === 0 || inArray(UserInitializationItem.Photos, initItems)) && user.photos === undefined) {
            user.photos = await this.photoRepository.find({user});
        }
    }

    public async findByUuid(uuid: string): Promise<User> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.settings', 'settings')
            .where({uuid})
            .getOne();

        user.setAvatar(await this.getAvatar(user));
        return user;
    }

    public async update(user: User, input: UpdateProfileDto): Promise<User> {
        let errors: Array<string> = [];
        let status = HttpStatus.UNPROCESSABLE_ENTITY;
        let error = HttpErrorCodes.UNPROCESSABLE_ENTITY;

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

        // Update profile
        await this.updateProfile(user, input);

        // Update settings
        await this.updateSettings(user, input);

        return this.userRepository.save(Object.assign(user, input));
    }

    public async delete(user: User): Promise<DeleteResult> {
        return this.userRepository.delete(user);
    }

    public async addPhoto(user: User, file: Express.Multer.File) {
        // Check is file is not too big
        const userMaximumImageSIze = await this.getUserMaximumImageSize(user);
        if (file.size > userMaximumImageSIze) {
            throw new Error(`File is too big (filesize is ${bytesToReadable(file.size)}, maximum size: ${bytesToReadable(userMaximumImageSIze)})`);
        }

        // Check is user can upload one more file
        const photosCount = await this.getUserImagesCount(user);
        const userImagesLimit = await this.getUserImagesLimit(user);
        if (photosCount >= userImagesLimit) {
            throw new Error(`User already has a maximum (${photosCount}) photos uploaded`);
        }

        // Save photo image file
        const fileName = await this.fileSystem.saveUserPhoto(user, file);

        // Get user avatar
        const avatar = await this.getAvatar(user);

        // Create new "Photo" entity (transform file's path to relative path that can be used as a relative web-link)
        let photo = new Photo();
        photo.fileName = fileName;
        photo.size = file.size;
        // If user has no avatar yet, set current photo as an avatar
        photo.isAvatar = avatar === undefined;

        // Add new photo to user's entity
        user.addPhoto(photo);

        // Save user (it will insert the new "photo" record in DB and join it to current user)
        await this.userRepository.save(user);
    }

    public async setPhotos(user: User, photos: ImageData[]) {
        if (photos.length === 0) {
            return;
        }

        const userMaximumImageSIze = await this.getUserMaximumImageSize(user);
        let files: Express.Multer.File[] = [];

        // Find new avatar among photos
        photos.some((photo, index) => {
            if (photo.isAvatar) {
                // Check the avatar size
                if (photo.size > userMaximumImageSIze) {
                    throw new Error(`File "${photo.name}" is too big (filesize is ${bytesToReadable(photo.size)}, maximum size: ${bytesToReadable(userMaximumImageSIze)})`);
                }
                // Remove and avatar from photos
                removeByIndex(index, photos);
                // Add new avatar as first "files" array's element
                files.push(base64ToFile(photo.name, photo.size, photo.src));
                return true;
            }
        });

        // Convert photos of File objects nad add them to images array
        photos.forEach(photo => {
            // Check the photo size
            if (photo.size > userMaximumImageSIze) {
                throw new Error(`File "${photo.name}" is too big (filesize is ${bytesToReadable(photo.size)}, maximum size: ${bytesToReadable(userMaximumImageSIze)})`);
            }
            // Add photo to files array
            files.push(base64ToFile(photo.name, photo.size, photo.src));
        });

        // Check is user can upload this count of photos
        const userImagesLimit = await this.getUserImagesLimit(user);
        if (files.length > userImagesLimit) {
            throw new Error(`Can not upload more than (${userImagesLimit}) photos`);
        }

        // Remove old user's photos
        this.fileSystem.removeUserPhotos(user.uuid);
        await this.photoRepository.delete({user});
        user.photos = [];

        // Add new images
        for (const file of files) {
            await this.addPhoto(user, file);
        }
    }

    public async getAvatar(user: User): Promise<Photo | undefined> {
        return user.getAvatar() ?? await this.createPhotoBaseQuery(user).andWhere('isAvatar = 1').getOne();
    }

    public async getPhotosByUserUuid(uuid: string): Promise<Photo[]> {
        return this.photoRepository.createQueryBuilder('p')
            .innerJoin('p.user', 'u')
            .where('u.uuid = :uuid', {uuid: uuid})
            .getMany();
    }

    public async updatePassword(user: User, data: UpdatePasswordDto) {
        // Compare passwords
        if (data.password !== data.retypedPassword) {
            throw new Error('Passwords are not match');
        }
        // Check is password is new
        if (data.password === data.oldPassword) {
            throw new Error('Create a new password');
        }
        // Check old password
        const isMatch = await bcrypt.compare(data.oldPassword, user.password);
        if (!isMatch) {
            throw new Error('Invalid current password');
        }
        // Update password
        user.password = await hashPassword(data.password);
        await this.userRepository.save(user);
    }

    private createPhotoBaseQuery(user: User): SelectQueryBuilder<Photo> {
        return this.photoRepository.createQueryBuilder('p')
            .where('p.userId = :userId', {userId: user.id});
    }

    private async updateProfile(user: User, input: UpdateProfileDto): Promise<void> {
        if (user.profile === undefined) {
            user.profile = await this.profileRepository.findOne({user});
        }

        let changed = false;
        if (user.profile.gender !== input.gender) {
            changed = true;
            user.profile.gender = input.gender;
        }
        if (user.profile.orientation !== input.orientation) {
            changed = true;
            user.profile.orientation = input.orientation;
        }
        if (user.profile.birthday !== input.birthday) {
            changed = true;
            user.profile.birthday = input.birthday;
        }
        if (user.profile.about !== input.about) {
            changed = true;
            user.profile.about = input.about;
        }

        if (changed) {
            await this.profileRepository.save(user.profile);
        }
    }

    private async updateSettings(user: User, input: UpdateProfileDto): Promise<void> {
        if (user.settings === undefined) {
            user.settings = await this.settingsRepository.findOne({user});
        }

        let changed = false;
        if (user.settings.showGender !== input.showGender) {
            changed = true;
            user.settings.showGender = input.showGender;
        }

        if (changed) {
            await this.settingsRepository.save(user.settings);
        }
    }

    private async getUserMaximumImageSize(user: User): Promise<number> {
        const userSettings = user.settings ?? await this.settingsRepository.findOne({user});
        return  userSettings.maximumImageSIze ?? Number(process.env.DEFAULT_USER_MAX_IMAGE_SIZE);
    }

    private async getUserImagesLimit(user: User): Promise<number> {
        const userSettings = user.settings ?? await this.settingsRepository.findOne({user});
        return userSettings.imagesLimit ?? Number(process.env.DEFAULT_USER_IMAGES_LIMIT);
    }

    private async getUserImagesCount(user: User): Promise<number> {
        return user.photos.length ?? await this.photoRepository.count({user});
    }
}