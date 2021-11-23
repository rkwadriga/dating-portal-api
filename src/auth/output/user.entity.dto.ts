import {Expose} from "class-transformer";
import {User} from "../user.entity";
import {TokenEntityDto} from "./token.entity.dto";

export class UserEntityDto {
    @Expose()
    id: string;

    @Expose()
    email: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    token: TokenEntityDto

    constructor(
        user: User,
        token: TokenEntityDto
    ) {
        Object.assign(this, {...user, token, id: user.uuid});
    }
}