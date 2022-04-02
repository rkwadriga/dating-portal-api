import {Injectable} from "@nestjs/common";
import * as fs from 'fs';
import * as MD5 from "crypto-js/md5"
import { promisify } from 'util';
import { User } from "../auth/user.entity";
import {inArray} from "../helpers/array.helper";

@Injectable()
export class FileSystemService {
    private allowedPhotosExtensions = ['jpg', 'jpeg', 'png'];
    private md5Buffer = 1024;

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
        const ext = file.originalname.match(/^.+\.(\w+)$/);
        if (!ext) {
            throw new Error(`Invalid file name: "${file.originalname}"`);
        }
        if (!inArray(ext[1], this.allowedPhotosExtensions)) {
            throw new Error(`Files with extension "${ext[1]}" are not allowed`);
        }

        return this.getFileMd5(file) + '.' + ext[1];
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
}