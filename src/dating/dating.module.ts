import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {LocalStrategy} from "../auth/strategies/local.strategy";
import {JwtStrategy} from "../auth/strategies/jwt.strategy";
import {Photo} from "../profile/photo.entity";
import {User} from "../auth/user.entity";
import {ProfilesService} from "./profiles.service";
import {ProfilesController} from "./profiles.controller";
import {Profile} from "../profile/profile.entity";
import {Settings} from "../profile/settings.entity";
import {Dating} from "./dating.entity";
import {DatingService} from "./dating.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Photo, Profile, Settings, Dating])
    ],
    providers: [LocalStrategy, JwtStrategy, ProfilesService, DatingService],
    controllers: [ProfilesController]
})
export class DatingModule {

}