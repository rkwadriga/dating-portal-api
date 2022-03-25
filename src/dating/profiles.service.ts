import {InjectRepository} from "@nestjs/typeorm";
import {Injectable} from "@nestjs/common";
import {User} from "../auth/user.entity";
import {Repository} from "typeorm";
import {Photo} from "../profile/photo.entity";

@Injectable()
export class ProfilesService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>,
    ) {}
}