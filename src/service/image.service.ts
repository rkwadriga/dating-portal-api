import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import { getFileExt } from "../helpers/file.helper";
import { inArray } from "../helpers/array.helper";
import { imagesConfig } from "../config/images.config";
import sizeOf from 'image-size';
import * as gm from 'gm';
import { ImageException, ImageExceptionCodes } from "../exceptions/image.exception";
import { FileSystemException, FileSystemExceptionCodes } from "../exceptions/fileSystem.exception";

@Injectable()
export class ImageService {
    private allowedExtensions = imagesConfig.allowedExtensions;
    private defaultSize = imagesConfig.defaultSize;
    private maxSize = imagesConfig.maxSize;

    public async resize(sourcePath: string, size?: string): Promise<string> {
        if (!size) {
            size = this.defaultSize;
        } else {
            this.checkSize(size);
        }

        // If resized file already exist - just return it
        const targetPath = this.getSizedPath(sourcePath, size);
        if (fs.existsSync(targetPath)) {
            return targetPath;
        }

        // Check the original image
        this.checkImage(sourcePath);

        // If original image size it the same like requested size - just return the original
        const [sourceH, sourceW] = Object.values(sizeOf(sourcePath));
        const [targetW, targetH] = ImageService.getSize(size);
        if (targetW === sourceW && targetH === sourceH) {
            return sourcePath;
        }

        // Calculate size of borders
        let [borderW, borderH] = [0, 0];
        const [sourceK, targetK] = [sourceW / sourceH, targetW / targetH];
        if (sourceK < targetK) {
            borderW = (targetK * sourceH - sourceW) / 2;
        } else if (sourceK > targetK) {
            borderH = (sourceW / targetK - sourceH) / 2;
        } else if (sourceK === targetK) {
            // The same ratio of width and height as in original image: no need borders
        } else if (sourceK < 1) {
            borderW = (sourceW / sourceK - sourceW) / 2;
        } else if (sourceK > 1) {
            borderH = (sourceH * sourceK - sourceH) / 2;
        }

        // Add borders to original image, resize it and save with a new name
        let error;
        let isDone = false;
        await gm(sourcePath)
            .border(borderW, borderH)
            .resize(targetW, targetH)
            .write(targetPath, (err) => {
                if (err) {
                    error = new ImageException(err.message, ImageExceptionCodes.CAN_NOT_RESIZE);
                } else if (!fs.existsSync(targetPath)) {
                    error = new FileSystemException(`Can not save the file ${targetPath}`, FileSystemExceptionCodes.CAN_NOT_SAVE);
                }
                isDone = true;
            });

        // Await for resize
        while (!isDone) {
            await (async () => new Promise(res => setTimeout(res, 10)))();
        }

        if (error) {
            throw error;
        }

        return targetPath;
    }

    private checkImage(path: string): void {
        if (!fs.existsSync(path)) {
            throw new FileSystemException(`File ${path} does not exist`, FileSystemExceptionCodes.FILE_NOT_FOUND);
        }
        const ext = getFileExt(path);
        if (!inArray(ext, this.allowedExtensions)) {
            throw new ImageException(`Images with extension "${ext}" are not allowed`, ImageExceptionCodes.INVALID_EXTENSION);
        }
    }

    private static getSize(size: string): [number, number] {
        const [x, y] = size.split('x');
        return [parseInt(x), parseInt(y)];
    }

    private getSizedPath(path: string, size: string, prefix = '-'): string {
        const pattern = RegExp(`^(.+)\\.(${this.allowedExtensions.join('|')})$`);
        if (!path.match(pattern)) {
            throw new FileSystemException(`Invalid original file path: ${path}`, FileSystemExceptionCodes.INVALID_PATH);
        }
        return path.replace(pattern, `$1${prefix}${size}.$2`);
    }

    private checkSize(size: string): void {
        // Check the size string format
        if (!size.match(/^\d+x\d+$/)) {
            throw new ImageException(`Invalid size format: "${size}"`, ImageExceptionCodes.INVALID_SIZE);
        }
        const [targetW, targetH, maxW, maxH] = [...ImageService.getSize(size), ...ImageService.getSize(this.maxSize)];
        if (targetW > maxW || targetH > maxH) {
            throw new ImageException(`Too big size: ${size}. Maximum size is ${this.maxSize}`, ImageExceptionCodes.INVALID_SIZE);
        }
    }
}