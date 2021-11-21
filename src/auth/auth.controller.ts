import {
    ClassSerializerInterceptor,
    Controller,
    Body,
    Get,
    Post,
    SerializeOptions,
    UseGuards,
    UseInterceptors,
    ValidationPipe
} from "@nestjs/common";
import {CreateUserDto} from "./input/create.user.dto";

@Controller('/api/auth')
export class AuthController {

    @Post('/registration')
    async registration(@Body() input: CreateUserDto) {
        console.log(input);
    }
}