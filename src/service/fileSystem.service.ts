import {Injectable} from "@nestjs/common";
import * as fs from 'fs';
import * as Path from 'path'
import { promisify } from 'util';
import { User } from "../auth/user.entity";

@Injectable()
export class FileSystemService {
    private allowedPhotosExtensions = ['jpg', 'jpeg', 'png'];

    public getImgDir(): string {
        return process.env.UPLOAD_DIRECTORY;
    }

    public async saveUserPhoto(user: User, file: Express.Multer.File): Promise<string> {
        // Generate random file name and add it to photos path
        const dirPath = this.getUserPhotosPath(user.uuid);
        const fileName = this.generatePhotoFileName(file);

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
        hash = hash.substring(0, 8) + hash.substring(hash.length - 8);
        const dirIndex = hash.substring(2, 3) + hash.substring(13, 14);

        return `${this.getImgDir()}/${dirIndex}/${hash}`;
    }

    private generatePhotoFileName(file: Express.Multer.File): string {
        // Get photo extension
        const ext = file.originalname.match(/^.+\.(\w+)$/);
        if (!ext || !this.allowedPhotosExtensions.includes(ext[1])) {
            throw Error('Invalid photo extensions');
        }

        return Math.random().toString(16).slice(2) + '.' + ext[1];
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