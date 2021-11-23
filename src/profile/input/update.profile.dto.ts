import {IsEmail, IsString, Length, IsOptional} from "class-validator";

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
}