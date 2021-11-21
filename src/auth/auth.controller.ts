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
import {UserEntityDto} from "./output/user.entity.dto";

@Controller('/api/auth')
@SerializeOptions({strategy: 'excludeAll'})
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('/registration')
    @UseInterceptors(ClassSerializerInterceptor)
    async registration(@Body() input: CreateUserDto) {
        const user = await this.authService.createUser(input);
        return new UserEntityDto(
            user,
            this.authService.getTokenForUser(user)
        );
    }
}