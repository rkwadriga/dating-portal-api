import {Expose} from "class-transformer";
import {User} from "../../auth/user.entity";
import {Gender} from "../profile.entity";

export class ProfileInfoDto {
    @Expose()
    id: string;

    @Expose()
    avatar: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    gender: Gender;

    @Expose()
    age: number;

    constructor(user: User) {
        Object.assign(this, {
            id: user.uuid,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.getAvatar()?.fileName,
            gender: user.profile.gender,
            age: user.getAge()
        });
    }
}