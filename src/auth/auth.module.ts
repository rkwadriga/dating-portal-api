import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshStrategy } from "./strategies/refresh.strategy";
import { User } from "./user.entity";
import { Profile } from "../profile/profile.entity";
import { Settings } from "../profile/settings.entity";
import { Rating } from "../profile/rating.entity";
import { LoggerService } from "../service/logger.service";
import { FileSystemService } from "../service/fileSystem.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Profile, Settings, Rating]),
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.AUTH_SECRET,
                signOptions: {
                    expiresIn: process.env.AUTH_TOKEN_LIFETIME
                }
            })
        })
    ],
    providers: [LocalStrategy, JwtStrategy, RefreshStrategy, AuthService, LoggerService, FileSystemService],
    controllers: [AuthController]
})
export class AuthModule {

}
