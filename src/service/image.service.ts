import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import { getFileExt } from "../helpers/file.helper";
import { inArray } from "../helpers/array.helper";
import { imagesConfig } from "../config/images.config";
import sizeOf from 'image-size';
import * as gm from 'gm';



@Injectable()
export class ImageService {
    private allowedExtensions = imagesConfig.allowedExtensions;
    private defaultSize = imagesConfig.defaultSize;

    public async resize(sourcePath: string, size?: string): Promise<string> {
        this.checkImage(sourcePath);
        const [width, height] = this.getSize(size);
        const [originH, originW, type] = Object.values(sizeOf(sourcePath));
        if (width === originH && height === originW) {
            return sourcePath;
        }
        // If resized file already exist - just return it
        const targetPath = this.getSizedPath(sourcePath, size);
        if (fs.existsSync(targetPath)) {
            return targetPath;
        }

        // Calculate for size of borders
        let borderWidth = 0, borderHeight = 0;
        const targetK = width/height;
        if (targetK > 1) {
            borderWidth = (originH * targetK - originW) / 2;
        } else if (targetK < 1) {
            borderHeight = (originW / targetK - originH) / 2;
        } else {
            const sourceK = originW / originH;
            if (sourceK > 1) {
                borderHeight = (originH * sourceK - originH) / 2;
            } else if (sourceK < 1) {
                borderWidth = (originW / sourceK - originW) / 2;
            }
        }

        // Add borders to original image, resize it and save with a new name
        let error;
        let isDone = false;
        await gm(sourcePath)
            .border(borderWidth, borderHeight)
            .resize(width, height)
            .write(targetPath, (err) => {
                if (err) {
                    error = err;
                } else if (!fs.existsSync(targetPath)) {
                    error = new Error(`Can not save the file ${targetPath}`);
                }
                isDone = true;
            });

        // Await for resize
        while (!isDone) {
            await (async () => new Promise(res => setTimeout(res, 10)))();
        }

        return targetPath;
    }

    private checkImage(path: string): void {
        if (!fs.existsSync(path)) {
            throw new Error(`File ${path} does not exist`);
        }
        const ext = getFileExt(path);
        if (!inArray(ext, this.allowedExtensions)) {
            throw new Error(`Images with extension "${ext}" are not allowed`);
        }
    }

    private getSize(size?: string): [number, number] {
        const [x, y] = (size ?? this.defaultSize).split('x');
        return [parseInt(x), parseInt(y)];
    }

    private getSizedPath(path: string, size: string, prefix = '-'): string {
        const pattern = RegExp(`^(.+)\\.(${this.allowedExtensions.join('|')})$`);
        if (!path.match(pattern)) {
            throw new Error(`Invalid file name: ${path}`);
        }
        return path.replace(pattern, `$1${prefix}${size}.$2`);
    }
}