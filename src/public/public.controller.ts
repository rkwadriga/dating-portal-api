import {
    Controller,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Req,
    StreamableFile
} from "@nestjs/common";
import { FileSystemService } from "../service/fileSystem.service";
import { createReadStream } from 'fs';
import { join } from 'path';
import { ImageService } from "../service/image.service";

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
            throw new InternalServerErrorException(e.message);
        }

        console.log(filePath);
        return new StreamableFile(createReadStream(join(process.cwd(), filePath)));
    }
}
