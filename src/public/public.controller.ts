import { 
    BadRequestException,
    Controller,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    StreamableFile
 } from "@nestjs/common";
import { FileSystemService } from "../service/fileSystem.service";
import { ImageService } from "../service/image.service";
import { BaseException } from "../exceptions/base.exception";
import { FileSystemExceptionCodes } from "../exceptions/fileSystem.exception";
import { inArray } from "../helpers/array.helper";
import { ImageExceptionCodes } from "../exceptions/image.exception";
import { createReadStream } from 'fs';
import { join } from 'path';
import { LoggerService } from "../service/logger.service";
import { LogsPaths } from "../config/logger.config";
import { SecurityService } from "../service/security.service";
import { SecurityException } from "../exceptions/security.exception";

@Controller('/public')
export class PublicController {
    constructor (
        private readonly fileSystem: FileSystemService,
        private readonly imageService: ImageService,
        private readonly security: SecurityService,
        private readonly logger: LoggerService
    ) {}

    @Get('/img/:data/:sign/:path?/:size?')
    public async getImage(
        @Param('data') data: string,
        @Param('sign') sign: string,
        @Param('path') path: string,
        @Param('size') size?: string
    ) {
        let userID;
        try {
            userID = this.security.checkSignature(data, sign).userID;
        } catch (e) {
            if (e instanceof SecurityException) {
                const requestData = {data, sign, path, size};
                this.logger.error(`Invalid signature given on "/public/img" request: ${JSON.stringify(requestData)}`, LogsPaths.SECURITY);
                throw new BadRequestException('Invalid signature');
            }
        }

        let filePath: string;
        if (path === process.env.DEFAULT_AVATAR_FILE_NAME) {
            filePath = await this.fileSystem.getDefaultAvatar(userID);
        } else {
            filePath = this.fileSystem.getUserPhotosPath(userID) + '/' + path;
        }

        // Check is file exist
        if (!this.fileSystem.fileExist(filePath)) {
            this.logger.error(`Can not find an image ${filePath}`, LogsPaths.PUBLIC);
            throw new NotFoundException(`File ${filePath} does not exist`);
        }
        // Resize image
        try {
            filePath = await this.imageService.resize(filePath, size);
        } catch (e) {
            this.logger.error(`Can not resize an image ${filePath}: ${e.message}`, LogsPaths.PUBLIC);
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
