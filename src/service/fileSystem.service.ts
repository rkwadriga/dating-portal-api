import {Injectable} from "@nestjs/common";
import * as fs from 'fs';
import * as Path from 'path'
import { promisify } from 'util';
import {User} from "../auth/user.entity";

@Injectable()
export class FileSystemService {
    private allowedPhotosExtensions = ['jpg', 'jpeg', 'png'];

    public getUserPhotosPath(user: User): string {
        // Create uploading dir indexed by user ID
        let dirIndex = (user.id < 1000 ? user.id : Math.round(user.id / 1000)).toString();
        const idLength = dirIndex.length;
        for (let i = 0; i < 4 - idLength; i++) {
            dirIndex = '0' +  dirIndex;
        }

        return `${process.env.UPLOAD_DIRECTORY}/${dirIndex}/${user.id}`;
    }

    public generatePhotoFileName(file: Express.Multer.File): string {
        // Get photo extension
        const ext = file.originalname.match(/^.+\.(\w+)$/);
        if (!ext || !this.allowedPhotosExtensions.includes(ext[1])) {
            throw Error('Invalid photo extensions');
        }

        return Math.random().toString(16).slice(2) + '.' + ext[1];
    }

    public generatePhotoFilePath(user: User, file: Express.Multer.File): string {
        return this.getUserPhotosPath(user) + '/' + this.generatePhotoFileName(file);
    }

    public async saveUserPhoto(user: User, file: Express.Multer.File): Promise<string> {
        // Generate random file name and add it to photos path
        const filePath = this.generatePhotoFilePath(user, file);
        // Create image dir
        this.createDir(Path.dirname(filePath));
        // Save photo image as file
        const writeFile = promisify(fs.writeFile);
        await writeFile(filePath, file.buffer);

        return filePath;
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