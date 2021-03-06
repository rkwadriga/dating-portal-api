import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import * as MD5 from "crypto-js/md5"
import { promisify } from 'util';
import { User } from "../auth/user.entity";
import { inArray } from "../helpers/array.helper";
import { getFileExt } from "../helpers/file.helper";
import { Repository } from 'typeorm';
import { InjectRepository } from "@nestjs/typeorm";
import { Gender } from "../profile/profile.entity";
import { imagesConfig } from "../config/images.config";
import { FileSystemException, FileSystemExceptionCodes } from "../exceptions/fileSystem.exception";
import { ImageException, ImageExceptionCodes } from "../exceptions/image.exception";
import * as path from "path";

@Injectable()
export class FileSystemService {
    private allowedPhotosExtensions = imagesConfig.allowedExtensions;
    private md5Buffer = 1024;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    public getImgDir(): string {
        return process.env.UPLOAD_DIRECTORY;
    }

    public getLogsDir(): string {
        return process.env.LOGS_DIRECTORY;
    }

    public fileExist(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    public async saveUserPhoto(user: User, file: Express.Multer.File): Promise<string> {
        // Generate random file name and add it to photos path
        const dirPath = this.getUserPhotosPath(user.uuid);
        const fileName = this.generatePhotoFileName(file);
        const filePath = dirPath + '/' + fileName;

        // If this file already exist - throw an error
        if (this.fileExist(filePath)) {
            throw new FileSystemException(`File ${filePath} already exist`, FileSystemExceptionCodes.FILE_ALREADY_EXIST);
        }

        // Create image dir
        this.createDir(dirPath);
        // Save photo image as file
        const writeFile = promisify(fs.writeFile);
        await writeFile(dirPath + '/' + fileName, file.buffer);

        return fileName;
    }

    public getUserPhotosPath(uuid: string): string {
        // Create uploading dir indexed by user ID
        let hash = uuid.replace(/-/g, 'g');
        const length = hash.length;
        const halfLength = Math.round(length / 2);
        const dirIndex = hash.substring(2, 3) + hash.substring(length - 3, length - 2);
        hash = hash.substring(0, 5) + hash.substring(halfLength - 3, halfLength + 3) + hash.substring(length - 5);

        return `${this.getImgDir()}/${dirIndex}/${hash}`;
    }

    public async getDefaultAvatar(uuid: string): Promise<string> {
        const genderData = await this.userRepository
            .createQueryBuilder('u')
            .select('p.gender', 'gender')
            .innerJoin('u.profile', 'p')
            .where({uuid})
            .getRawOne();
        const gender = genderData ? genderData.gender : Gender.Other;

        return `${this.getDefaultImgPath()}/${gender}.jpeg`;
    }

    public removeUserPhotos(uuid: string): void {
        this.delete(this.getUserPhotosPath(uuid));
    }

    public getFileDir(file: string, autoCreate = false): string {
        const dir = path.dirname(file);
        if (autoCreate) {
            this.createDir(dir);
        }
        return dir;
    }

    public fileSIze(file: string): number {
        return this.fileExist(file) ? fs.statSync(file).size : 0;
    }

    public scandir(dir: string): string[] {
        return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    }

    public createDir(path: string): void {
        if (fs.existsSync(path)) {
            return;
        }

        let createdPath = '';
        path.split('/').forEach(dir => {
            createdPath += dir + '/';
            if (!fs.existsSync(createdPath)) {
                fs.mkdirSync(createdPath);
            }
        });
    }

    public delete(path: string): void {
        if (!fs.existsSync(path)) {
            return;

        }
        if (fs.lstatSync(path).isDirectory()) {
            fs.rmdirSync(path, {recursive: true});
        } else {
            fs.unlinkSync(path);
        }
    }

    public rename(oldPath: string, newName: string): void {
        if (oldPath === newName) {
            return;
        }
        if (!fs.existsSync(oldPath)) {
            return;
        }
        if (fs.existsSync(newName)) {
            this.delete(oldPath);
            return;
        }

        fs.renameSync(oldPath, newName);
    }

    public write(file: string, data: string, append = false): void {
        fs.writeFileSync(file, data, {flag: append ? 'a' : 'w+'});
    }

    private getFileMd5(file: Express.Multer.File): string {
        let fileContent;
        if (file.size > this.md5Buffer * 2) {
            const buffer = file.buffer;
            // Get first and last 1024 bytes of file
            fileContent = buffer.slice(0, this.md5Buffer).toString() + buffer.slice(file.size - this.md5Buffer).toString();
        } else {
            fileContent = file.buffer.toString();
        }

        return MD5(fileContent);
    }

    private generatePhotoFileName(file: Express.Multer.File): string {
        // Get photo extension and check is it allowed
        const ext = getFileExt(file.originalname);
        if (ext === null) {
            throw new FileSystemException(`Invalid file name: "${file.originalname}"`, FileSystemExceptionCodes.INVALID_PATH);
        }
        if (!inArray(ext, this.allowedPhotosExtensions)) {
            throw new ImageException(`Files with extension "${ext}" are not allowed`, ImageExceptionCodes.INVALID_EXTENSION);
        }

        return this.getFileMd5(file) + '.' + ext;
    }

    private getDefaultImgPath(): string {
        return this.getImgDir() + '/' + process.env.DEFAULT_AVATAR_PATH;
    }
}