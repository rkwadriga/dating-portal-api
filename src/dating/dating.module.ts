import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LocalStrategy } from "../auth/strategies/local.strategy";
import { JwtStrategy } from "../auth/strategies/jwt.strategy";
import { Photo } from "../profile/photo.entity";
import { User } from "../auth/user.entity";
import { ProfilesService } from "./profiles.service";
import { ProfilesController } from "./profiles.controller";
import { Profile } from "../profile/profile.entity";
import { Settings } from "../profile/settings.entity";
import { Contact } from "./contact.entity";
import { DatingService } from "./dating.service";
import { PairsController } from "./pairs.controller";
import { LoggerService } from "../service/logger.service";
import { FileSystemService } from "../service/fileSystem.service";
import { RatingService } from "../service/rating.service";
import { Rating } from "../profile/rating.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Photo, Profile, Settings, Contact, Rating])
    ],
    providers: [
        LocalStrategy,
        JwtStrategy,
        ProfilesService,
        DatingService,
        LoggerService,
        FileSystemService,
        RatingService
    ],
    controllers: [ProfilesController, PairsController]
})
export class DatingModule {

}