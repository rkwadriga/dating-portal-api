import {Injectable} from "@nestjs/common";
import * as fs from 'fs';
import * as MD5 from "crypto-js/md5"
import {promisify} from 'util';
import {User} from "../auth/user.entity";
import {inArray} from "../helpers/array.helper";
import {getFileExt} from "../helpers/file.helper";
import {Repository} from 'typeorm';
import {InjectRepository} from "@nestjs/typeorm";
import {Gender} from "../profile/profile.entity";

@Injectable()
export class FileSystemService {
    private allowedPhotosExtensions = ['jpg', 'jpeg', 'png'];
    private md5Buffer = 1024;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    public getImgDir(): string {
        return process.env.UPLOAD_DIRECTORY;
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
            throw new Error(`File ${filePath} already exist`);
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
            throw new Error(`Invalid file name: "${file.originalname}"`);
        }
        if (!inArray(ext, this.allowedPhotosExtensions)) {
            throw new Error(`Files with extension "${ext}" are not allowed`);
        }

        return this.getFileMd5(file) + '.' + ext;
    }

    private createDir(path: string): void {
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

    private delete(path: string): void {
        if (!fs.existsSync(path)) {
            return;

        }
        if (fs.lstatSync(path).isDirectory()) {
            fs.rmdirSync(path, {recursive: true});
        } else {
            fs.unlinkSync(path);
        }
    }

    private getDefaultImgPath(): string {
        return this.getImgDir() + '/' + process.env.DEFAULT_AVATAR_PATH;
    }
}