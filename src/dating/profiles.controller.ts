import {Controller, Get, SerializeOptions, UseGuards} from "@nestjs/common";
import {ProfilesService} from "./profiles.service";
import {AuthGuardJwt} from "../auth/guards/auth-guard.jwt";
import {CurrentUser} from "../auth/current-user.decorator";
import {User} from "../auth/user.entity";
import {ProfileInfoDto} from "../profile/output/profile.info.dto";

@Controller('/api/profiles')
@SerializeOptions({strategy: 'excludeAll'})
export class ProfilesController {
    constructor (
        private readonly profilesService: ProfilesService
    ) {}

    @Get()
    @UseGuards(AuthGuardJwt)
    async list(@CurrentUser() user: User) {
        const users = await this.profilesService.getProfilesForUser(user);

        let result = [];
        users.forEach(user => {
            result.push(new ProfileInfoDto(user));
        });

        return result;
    }
}