import {IsEmail, IsString, IsNumber, Length, IsOptional} from "class-validator";
import {Gender, Orientation} from "../profile.entity";

export class UpdateProfileDto {
    @IsEmail()
    @IsOptional()
    email: string;

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
    @Length(3, 8)
    orientation: Orientation;

    @IsString()
    @IsOptional()
    @Length(4, 6)
    showGender?: Gender = null;

    @IsNumber()
    @IsOptional()
    showAgeFrom?: number;

    @IsNumber()
    @IsOptional()
    showAgeTo?: number;

    @IsOptional()
    birthday: Date;

    @IsString()
    @IsOptional()
    @Length(2, 5000)
    about: string;
}