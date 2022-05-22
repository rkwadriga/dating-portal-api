import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    Post,
    Put,
    SerializeOptions,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { CreateUserDto } from "./input/create.user.dto";
import { AuthService } from "./auth.service";
import { UserEntityDto } from "./output/user.entity.dto";
import { AuthGuardLocal } from "./guards/auth-guard.local";
import { CurrentUser } from "./current-user.decorator";
import { User } from "./user.entity";
import { AuthGuardRefresh } from "./guards/auth-guard.refresh";
import { RefreshTokenDto } from "./input/refresh.token.dto";
import { LoggerService, LogsPaths } from "../service/logger.service";

@Controller('/api/auth')
@SerializeOptions({strategy: 'excludeAll'})
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly logger: LoggerService
    ) {
        this.logger.setPath(LogsPaths.AUTH);
    }

    @Post('/registration')
    @UseInterceptors(ClassSerializerInterceptor)
    async registration(@Body() input: CreateUserDto) {
        let user: User;
        try {
            user = await this.authService.createUser(input);
        } catch (e) {
            const message = `Can not register a user: ${e.message}`;
            this.logger.error(message, input);
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
        this.logger.info(`User #${user.id} is logged in`);
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
        const newToken = this.authService.getTokenForUser(user);
        this.logger.info(`User #${user.id} refreshed the token`, {oldToken: input, newToken: newToken});
        return new UserEntityDto(user, newToken);
    }

    @Get('/check-username/:username')
    async checkUsername(@Param('username') username: string) {
        return {
            result: await this.authService.getUserByUsername(username) === null
        };
    }
}