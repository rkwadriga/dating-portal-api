import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Body,
    Post,
    Put,
    SerializeOptions,
    UseGuards,
    UseInterceptors,
    Param
} from "@nestjs/common";
import {CreateUserDto} from "./input/create.user.dto";
import {AuthService} from "./auth.service";
import {UserEntityDto} from "./output/user.entity.dto";
import {AuthGuardLocal} from "./guards/auth-guard.local";
import {CurrentUser} from "./current-user.decorator";
import {User} from "./user.entity";
import {AuthGuardRefresh} from "./guards/auth-guard.refresh";
import {RefreshTokenDto} from "./input/refresh.token.dto";

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

    @Post('/login')
    @UseGuards(AuthGuardLocal)
    @UseInterceptors(ClassSerializerInterceptor)
    async login(@CurrentUser() user: User) {
        return new UserEntityDto(
            user,
            this.authService.getTokenForUser(user)
        );
    }

    @Put('/refresh')
    @UseGuards(AuthGuardRefresh)
    @UseInterceptors(ClassSerializerInterceptor)
    async refresh(@Body() input: RefreshTokenDto) {
        const user = await this.authService.refreshUserToken(input);
        return new UserEntityDto(
            user,
            this.authService.getTokenForUser(user)
        );
    }

    @Get('/check-username/:username')
    async checkUsername(@Param('username') username: string) {
        return {
            result: await this.authService.getUserByUsername(username) === null
        };
    }
}