import {ProfileInfoDto} from "./profile.info.dto";
import {Expose} from "class-transformer";

export class MeInfoDto extends ProfileInfoDto {
    @Expose()
    email: string;
}