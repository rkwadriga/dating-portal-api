import {Expose} from "class-transformer";
import {User} from "../../auth/user.entity";


export class ProfileInfoDto {
    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    constructor(user: User) {
        Object.assign(this, user);
    }
}