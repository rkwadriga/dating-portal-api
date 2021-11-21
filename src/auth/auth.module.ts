import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {AuthController} from "./auth.controller";
import {JwtModule} from "@nestjs/jwt";
import {AuthService} from "./auth.service";

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
    providers: [AuthService],
    controllers: [AuthController]
})
export class AuthModule {

}
