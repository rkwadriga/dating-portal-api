import {Injectable, Logger, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy} from "passport-local";
import {User} from "../auth/user.entity";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export  class LocalStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(LocalStrategy.name);
    
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {
        super();
    }
    
    public async validate(email: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({email});
        if (!user) {
            this.logger.debug(`User ${email} not found!`);
            throw new UnauthorizedException();
        }
        if (!(await bcrypt.compare(password, user.password))) {
            this.logger.debug(`Invalid credentials for user ${email}`);
            throw new UnauthorizedException();
        }
        
        return user;
    }
}