import {Controller, Get, NotFoundException, SerializeOptions, UseGuards} from "@nestjs/common";
import {ProfilesService} from "./profiles.service";
import {AuthGuardJwt} from "../auth/guards/auth-guard.jwt";
import {CurrentUser} from "../auth/current-user.decorator";
import {User} from "../auth/user.entity";
import {ProfileInfoDto} from "./output/profile.info.dto";

@Controller('/api/dating/profiles')
@SerializeOptions({strategy: 'excludeAll'})
export class ProfilesController {
    constructor (
        private readonly profilesService: ProfilesService
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
}