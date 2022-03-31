import {Controller, Get, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import { FileSystemService } from "../service/fileSystem.service";
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('/public')
export class PublicController {
    constructor (
        private readonly fileSystem: FileSystemService
    ) {}

    @Get('/img/:userID/:path')
    public async getImage(
        @Param('userID') userID: string,
        @Param('path') path: string,
    ) {
        const filePath = this.fileSystem.getUserPhotosPath(userID) + '/' + path;

        // Check is file exist
        if (!this.fileSystem.fileExist(filePath)) {
            throw new NotFoundException(`File ${filePath} does not exist`);
        }

        return new StreamableFile(createReadStream(join(process.cwd(), filePath)));
    }
}
