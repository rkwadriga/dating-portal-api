import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {AuthController} from "./auth.controller";
import {JwtModule} from "@nestjs/jwt";
import {AuthService} from "./auth.service";
import {LocalStrategy} from "./strategies/local.strategy";
import {JwtStrategy} from "./strategies/jwt.strategy";
import {RefreshStrategy} from "./strategies/refresh.strategy";
import {Profile} from "../profile/profile.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Profile]),
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.AUTH_SECRET,
                signOptions: {
                    expiresIn: process.env.AUTH_TOKEN_LIFETIME
                }
            })
        })
    ],
    providers: [LocalStrategy, JwtStrategy, RefreshStrategy, AuthService],
    controllers: [AuthController]
})
export class AuthModule {

}
