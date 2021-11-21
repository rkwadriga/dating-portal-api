import {
    ClassSerializerInterceptor,
    Controller,
    Body,
    Get,
    Post,
    SerializeOptions,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
    BadRequestException
} from "@nestjs/common";
import {CreateUserDto} from "./input/create.user.dto";
import {AuthService} from "./auth.service";

@Controller('/api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('/registration')
    async registration(@Body() input: CreateUserDto) {
        const user = await this.authService.createUser(input);

        return {
            ...user,
            token: this.authService.getTokenForUser(user)
        };
    }
}