import {Expose} from "class-transformer";
import {User} from "../../auth/user.entity";
import {ProfileInfoDto as BaseDto} from "../../profile/output/profile.info.dto";

export class ProfileInfoDto extends BaseDto {
    @Expose()
    images: string[] = [];

    constructor(user: User) {
        super(user);
        if (user.photos === undefined) {
            return;
        }

        if (this.avatar !== undefined) {
            this.images.push(this.avatar);
        }
        for (const photo of user.photos) {
            if (!photo.isAvatar) {
                this.images.push(photo.fileName);
            }
        }

        this.avatar = undefined;
    }
}