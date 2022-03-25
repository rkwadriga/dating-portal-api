import {Controller, Get, SerializeOptions, UseGuards} from "@nestjs/common";
import {ProfilesService} from "./profiles.service";
import {AuthGuardJwt} from "../auth/guards/auth-guard.jwt";
import {CurrentUser} from "../auth/current-user.decorator";
import {User} from "../auth/user.entity";

@Controller('/api/profiles')
@SerializeOptions({strategy: 'excludeAll'})
export class ProfilesController {
    constructor (
        private readonly profilesService: ProfilesService
    ) {}

    @Get()
    @UseGuards(AuthGuardJwt)
    async list(@CurrentUser() user: User) {
        return user
    }
}