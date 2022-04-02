import {Expose} from "class-transformer";
import {Photo} from "../photo.entity";

export class PhotoInfoDto {
    @Expose()
    fileName: string;

    @Expose()
    isAvatar: boolean;

    @Expose()
    size: number;

    constructor(photo: Photo) {
        this.fileName = photo.fileName;
        this.isAvatar = photo.isAvatar;
        this.size = photo.size;
    }
}