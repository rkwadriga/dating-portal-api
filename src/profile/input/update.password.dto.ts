import {IsOptional, IsString, Length} from "class-validator";

export class UpdatePasswordDto {
    @IsString()
    @Length(4, 255)
    @IsOptional()
    oldPassword: string

    @IsString()
    @Length(4, 255)
    @IsOptional()
    password: string;

    @IsString()
    @Length(4, 255)
    @IsOptional()
    retypedPassword: string;
}