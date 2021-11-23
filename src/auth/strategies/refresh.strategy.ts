import {ExtractJwt, Strategy} from "passport-jwt";
import {PassportStrategy} from "@nestjs/passport";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../user.entity";
import {Repository} from "typeorm";

export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
    constructor(
        @InjectRepository(User)
        public readonly userRepository: Repository<User>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('accessToken'),
            ignoreExpiration: false,
            secretOrKey: process.env.AUTH_SECRET
        });
    }

    async validate(payload: any) {
        return false;
    }
}