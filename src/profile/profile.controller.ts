import {
    ClassSerializerInterceptor,
    Controller,
    Get, NotFoundException, Param, ParseIntPipe,
    SerializeOptions,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {ProfileService} from "./profile.service";
import {AuthGuardJwt} from "../guards/auth-guard.jwt";
import {CurrentUser} from "../auth/current-user.decorator";
import {User} from "../auth/user.entity";
import {ProfileInfoDto} from "./output/profile.info.dto";
import {MeInfoDto} from "./output/me.info.dto";

@Controller('/api/profile')
@SerializeOptions({strategy: 'excludeAll'})
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService
    ) {}

    @Get('/:id')
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
        const profile = id !== user.id ? await this.profileService.findOne(id) : user;
        if (!profile) {
            throw new NotFoundException(`Profile not found`);
        }

        return profile !== user ? new ProfileInfoDto(profile) : new MeInfoDto(profile);
    }
}