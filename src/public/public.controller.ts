import {Controller, Get, Param, StreamableFile} from "@nestjs/common";
import {FileSystemService} from "../service/fileSystem.service";
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('/public')
export class PublicController {
    constructor (
        private readonly fileSystem: FileSystemService
    ) {}

    @Get('/img/:sub/:userID/:path')
    public async getImage(
        @Param('sub') sub: string,
        @Param('userID') userID: number,
        @Param('path') path: string,
    ) {
        const filePath = `${this.fileSystem.getImgDir()}/${sub}/${userID}/${path}`;
        const file = createReadStream(join(process.cwd(), filePath))

        return new StreamableFile(file);
    }
}
