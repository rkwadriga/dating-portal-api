import {Expose} from "class-transformer";
import {User} from "../../auth/user.entity";
import {ProfileInfoDto as BaseDto} from "../../profile/output/profile.info.dto";

export class ProfileInfoDto extends BaseDto {
    @Expose()
    photos: string[] = [];

    @Expose()
    isPair = false;

    constructor(user: User) {
        super(user);

        if (user.photos === undefined) {
            return;
        }

        if (this.avatar !== undefined) {
            this.photos.push(this.avatar);
        }
        for (const photo of user.photos) {
            if (!photo.isAvatar) {
                this.photos.push(photo.fileName);
            }
        }

        this.isPair = user.isPair;
    }
}