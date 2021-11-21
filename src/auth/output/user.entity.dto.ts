import {Expose} from "class-transformer";
import {User} from "../user.entity";

export class UserEntityDto {
    @Expose()
    id: number;

    @Expose()
    email: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    token: string

    constructor(
        user: User,
        token: string
    ) {
        Object.assign(this, {...user, token});
    }
}