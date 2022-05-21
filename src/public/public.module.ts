import { Module } from "@nestjs/common";
import { PublicController } from "./public.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../auth/user.entity";
import { Profile } from "../profile/profile.entity";
import { FileSystemService } from "../service/fileSystem.service";
import { ImageService } from "../service/image.service";
import { LoggerService } from "../service/logger.service";
import { SecurityService } from "../service/security.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Profile])
    ],
    providers: [FileSystemService, ImageService, LoggerService, SecurityService],
    controllers: [PublicController]
})
export class PublicModule {

}