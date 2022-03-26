import {InjectRepository} from "@nestjs/typeorm";
import {Injectable} from "@nestjs/common";
import {User} from "../auth/user.entity";
import {Repository} from "typeorm";
import {Photo} from "../profile/photo.entity";
import {Settings} from "../profile/settings.entity";

@Injectable()
export class ProfilesService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>,
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>
    ) {}

    public async getProfilesForUser(user: User): Promise<User[]>
    {
        if (user.settings === undefined) {
            user.settings = await this.settingsRepository.findOne({user});
        }
        let condition = 'user.id != :current_user_id';
        let parameters = {'current_user_id': user.id};
        if (user.settings.showGender !== null) {
            condition += ' AND profile.gender = :showing_gender';
            parameters['showing_gender'] = user.settings.showGender;
        }

        return await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.photos', 'avatar', 'avatar.isAvatar = 1')
            .where(condition, parameters)
            .getMany();
    }
}