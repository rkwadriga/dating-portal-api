import {Module} from "@nestjs/common";
import {FileSystemService} from "../service/fileSystem.service";
import {PublicController} from "./public.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../auth/user.entity";
import {Profile} from "../profile/profile.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Profile])
    ],
    providers: [FileSystemService],
    controllers: [PublicController]
})
export class PublicModule {

}