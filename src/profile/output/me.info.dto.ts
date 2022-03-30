import {ProfileInfoDto} from "./profile.info.dto";
import {Expose} from "class-transformer";
import {User} from "../../auth/user.entity";

export class MeInfoDto extends ProfileInfoDto {
    @Expose()
    email: string;

    constructor(user: User) {
        super(user);
        this.email = user.email;
    }
}