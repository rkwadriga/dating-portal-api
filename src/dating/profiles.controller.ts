import {
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    NotFoundException, Param, ParseUUIDPipe,
    SerializeOptions,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {ProfilesService} from "./profiles.service";
import {AuthGuardJwt} from "../auth/guards/auth-guard.jwt";
import {CurrentUser} from "../auth/current-user.decorator";
import {User} from "../auth/user.entity";
import {ProfileInfoDto} from "./output/profile.info.dto";
import {DatingService} from "./dating.service";

@Controller('/api/dating/profiles')
@SerializeOptions({strategy: 'excludeAll'})
export class ProfilesController {
    constructor (
        private readonly profilesService: ProfilesService,
        private readonly datingService: DatingService
    ) {}

    @Get('/next')
    @UseGuards(AuthGuardJwt)
    async list(@CurrentUser() user: User) {
        const nextProfile = await this.profilesService.getNextProfileForUser(user);
        if (nextProfile === null) {
            throw new NotFoundException('There are no move accounts left');
        }

        return new ProfileInfoDto(nextProfile);
    }

    @Delete()
    @UseGuards(AuthGuardJwt)
    async clearDatings(@CurrentUser() user: User) {
        await this.datingService.clearDatingsForUser(user);

        return {};
    }

    @Get('/:id')
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        const profile = await this.profilesService.getProfileInfoByUuid(id);
        if (!profile) {
            throw new NotFoundException(`Profile not found`);
        }

        return new ProfileInfoDto(profile);
    }
}