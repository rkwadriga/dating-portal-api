import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import {User} from "../user.entity";
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        public readonly userRepository: Repository<User>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.AUTH_SECRET
        });
    }
    
    async validate(payload: any) {
        return await this.userRepository.findOne(payload.sub);
    }
}