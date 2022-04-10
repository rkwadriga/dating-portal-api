import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    SerializeOptions,
    UseGuards
} from "@nestjs/common";
import {DatingService} from "./dating.service";
import {AuthGuardJwt} from "../auth/guards/auth-guard.jwt";
import {CurrentUser} from "../auth/current-user.decorator";
import {User} from "../auth/user.entity";
import {ProfileInfoDto} from "./output/profile.info.dto";

@Controller('/api/pairs')
@SerializeOptions({strategy: 'excludeAll'})
export class PairsController {
    constructor(
        private readonly datingService: DatingService
    ) { }

    @Get('/list')
    @UseGuards(AuthGuardJwt)
    async getList(@CurrentUser() user: User) {
        const users = await this.datingService.getPairs(user);
        const result: ProfileInfoDto[] = [];
        users.forEach(user => {
            result.push(new ProfileInfoDto(user));
        });

        return result;
    }
}