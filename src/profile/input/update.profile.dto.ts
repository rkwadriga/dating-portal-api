import {IsEmail, IsString, Length, IsOptional} from "class-validator";
import {Gender} from "../profile.entity";

export class UpdateProfileDto {
    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @Length(4, 255)
    @IsOptional()
    password: string;

    @IsString()
    @Length(4, 255)
    @IsOptional()
    retypedPassword: string;

    @IsString()
    @Length(2, 64)
    @IsOptional()
    firstName: string;

    @IsString()
    @Length(2, 64)
    @IsOptional()
    lastName: string;

    @IsString()
    @IsOptional()
    @Length(4, 6)
    gender: Gender;

    @IsString()
    @IsOptional()
    @Length(4, 6)
    showGender?: Gender = null;

    @IsOptional()
    birthday: Date;
}