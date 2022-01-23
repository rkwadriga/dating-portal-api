import {IsString, Length, IsNotEmpty} from "class-validator";

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    @Length(100)
    accessToken: string;

    @IsString()
    @IsNotEmpty()
    @Length(100)
    refreshToken: string;
}