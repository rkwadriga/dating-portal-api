import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {LocalStrategy} from "../auth/strategies/local.strategy";
import {JwtStrategy} from "../auth/strategies/jwt.strategy";
import {ProfileService} from "./profile.service";
import {ProfileController} from "./profile.controller";
import {FileSystemService} from "../service/fileSystem.service";
import {Photo} from "./photo.entity";
import {User} from "../auth/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Photo])
    ],
    providers: [LocalStrategy, JwtStrategy, ProfileService, FileSystemService],
    controllers: [ProfileController]
})
export class ProfileModule {

}