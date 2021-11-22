import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {JwtModule} from "@nestjs/jwt";
import {LocalStrategy} from "../strategies/local.strategy";
import {JwtStrategy} from "../strategies/jwt.strategy";
import {User} from "../auth/user.entity";
import {ProfileService} from "./profile.service";
import {ProfileController} from "./profile.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.AUTH_SECRET,
                signOptions: {
                    expiresIn: '63m'
                }
            })
        })
    ],
    providers: [LocalStrategy, JwtStrategy, ProfileService],
    controllers: [ProfileController]
})
export class ProfileModule {

}