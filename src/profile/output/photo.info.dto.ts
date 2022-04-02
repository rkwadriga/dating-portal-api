import {Expose} from "class-transformer";
import {Photo} from "../photo.entity";

export class PhotoInfoDto {
    @Expose()
    name: string;

    @Expose()
    isAvatar: boolean;

    @Expose()
    size: number;

    constructor(photo: Photo) {
        this.name = photo.fileName;
        this.isAvatar = photo.isAvatar;
        this.size = photo.size;
    }
}