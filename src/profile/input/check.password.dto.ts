import {IsString, Length} from "class-validator";

export class CheckPasswordDto {
    @IsString()
    @Length(4, 255)
    password: string;
}