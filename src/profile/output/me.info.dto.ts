import {ProfileInfoDto} from "./profile.info.dto";
import {Expose} from "class-transformer";
import {User} from "../../auth/user.entity";

export class MeInfoDto extends ProfileInfoDto {
    @Expose()
    email: string;

    @Expose()
    birthday: Date;

    @Expose()
    imagesLimit: number;

    @Expose()
    maximumImageSIze: number;

    constructor(user: User) {
        super(user);
        this.email = user.email;
        this.birthday = user.profile?.birthday;
        this.imagesLimit = user.settings?.imagesLimit ?? Number(process.env.DEFAULT_USER_IMAGES_LIMIT);
        this.maximumImageSIze = user.settings?.maximumImageSIze ?? Number(process.env.DEFAULT_USER_MAX_IMAGE_SIZE);
    }
}