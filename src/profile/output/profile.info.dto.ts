import {Expose} from "class-transformer";
import {User} from "../../auth/user.entity";
import {Gender, Orientation} from "../profile.entity";

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
    orientation: Orientation;

    @Expose()
    age: number;

    @Expose()
    about: string;

    constructor(user: User) {
        Object.assign(this, {
            id: user.uuid,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.getAvatar()?.fileName ?? process.env.DEFAULT_AVATAR_FILE_NAME,
            gender: user.profile.gender,
            orientation: user.profile.orientation,
            age: user.getAge(),
            about: user.profile.about
        });
    }
}