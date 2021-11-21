import {IsEmail, IsString, Length, IsNotEmpty, IsOptional} from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @Length(4, 255)
    @IsNotEmpty()
    password: string;

    @IsString()
    @Length(2, 64)
    @IsOptional()
    firstName: string;

    @IsString()
    @Length(2, 64)
    @IsOptional()
    lastName: string;
}