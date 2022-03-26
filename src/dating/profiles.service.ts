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

    public async getProfilesForUser(user: User): Promise<User[]>
    {
        return await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.photos', 'avatar', 'avatar.isAvatar = 1')
            .where('user.id != :current_user_id', {'current_user_id': user.id})
            .getMany();
    }
}