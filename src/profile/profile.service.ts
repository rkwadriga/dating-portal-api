import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../auth/user.entity";
import {Repository} from "typeorm";
import {Injectable} from "@nestjs/common";

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    public async findOne(id: number): Promise<User> {
        return this.userRepository.findOne({id});
    }
}