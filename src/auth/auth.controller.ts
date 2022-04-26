import { 
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get, InternalServerErrorException,
    Param,
    Post,
    Put,
    SerializeOptions,
    UseGuards,
    UseInterceptors
 } from  "@nestjs/common";
import { CreateUserDto } from  "./input/create.user.dto";
import { AuthService } from  "./auth.service";
import { UserEntityDto } from  "./output/user.entity.dto";
import { AuthGuardLocal } from  "./guards/auth-guard.local";
import { CurrentUser } from  "./current-user.decorator";
import { User } from  "./user.entity";
import { AuthGuardRefresh } from  "./guards/auth-guard.refresh";
import { RefreshTokenDto } from  "./input/refresh.token.dto";
import { LoggerService } from  "../service/logger.service";
import { LogsPaths } from  "../config/logger.config";

@Controller('/api/auth')
@SerializeOptions({strategy: 'excludeAll'})
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly logger: LoggerService
    ) {}

    @Post('/registration')
    @UseInterceptors(ClassSerializerInterceptor)
    async registration(@Body() input: CreateUserDto) {
        let user: User;
        try {
            user = await this.authService.createUser(input);
        } catch (e) {
            const message = `Can not register a user: ${e.message}`;
            this.logger.error(message, LogsPaths.AUTH, input);
            throw new InternalServerErrorException(message);
        }
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