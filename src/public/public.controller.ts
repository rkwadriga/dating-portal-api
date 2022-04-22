import {
    BadRequestException,
    Controller,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param, StreamableFile
} from "@nestjs/common";
import { FileSystemService } from "../service/fileSystem.service";
import { ImageService } from "../service/image.service";
import { BaseException } from "../exceptions/base.exception";
import { FileSystemExceptionCodes } from "../exceptions/fileSystem.exception";
import { inArray } from "../helpers/array.helper";
import { ImageExceptionCodes } from "../exceptions/image.exception";
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('/public')
export class PublicController {
    constructor (
        private readonly fileSystem: FileSystemService,
        private readonly imageService: ImageService
    ) {}

    @Get('/img/:userID/:path?/:size?')
    public async getImage(
        @Param('userID') userID: string,
        @Param('path') path: string,
        @Param('size') size?: string
    ) {
        let filePath: string;
        if (path === process.env.DEFAULT_AVATAR_FILE_NAME) {
            filePath = await this.fileSystem.getDefaultAvatar(userID);
        } else {
            filePath = this.fileSystem.getUserPhotosPath(userID) + '/' + path;
        }

        // Check is file exist
        if (!this.fileSystem.fileExist(filePath)) {
            throw new NotFoundException(`File ${filePath} does not exist`);
        }
        // Resize image
        try {
            filePath = await this.imageService.resize(filePath, size);
        } catch (e) {
            if (e instanceof BaseException) {
                if (e.code === FileSystemExceptionCodes.FILE_NOT_FOUND) {
                    throw new NotFoundException(e.message);
                }
                if (inArray(e.code, [ImageExceptionCodes.INVALID_SIZE, ImageExceptionCodes.INVALID_EXTENSION])) {
                    throw new BadRequestException(e.message);
                }
            }
            throw new InternalServerErrorException(e.message);
        }

        return new StreamableFile(createReadStream(join(process.cwd(), filePath)));
    }
}
