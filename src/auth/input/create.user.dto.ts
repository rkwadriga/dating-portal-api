import {IsEmail, IsNotEmpty, IsOptional, IsString, Length} from "class-validator";
import {Gender, Orientation} from "../../profile/profile.entity";

export class CreateUserDto {
    @IsString()
    @Length(36, 36)
    @IsOptional()
    id: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @Length(4, 255)
    @IsNotEmpty()
    password: string;

    @IsString()
    @Length(4, 255)
    @IsNotEmpty()
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
    gender: Gender;

    @IsString()
    @IsOptional()
    orientation: Orientation;

    @IsString()
    @IsOptional()
    @Length(4, 6)
    showGender?: Gender = null;

    @IsOptional()
    birthday: Date;
}