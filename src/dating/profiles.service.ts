import {InjectRepository} from "@nestjs/typeorm";
import {Injectable} from "@nestjs/common";
import {User} from "../auth/user.entity";
import {Repository} from "typeorm";
import {Photo} from "../profile/photo.entity";
import {Settings} from "../profile/settings.entity";
import {Dating} from "./dating.entity";

@Injectable()
export class ProfilesService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>,
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>,
        @InjectRepository(Dating)
        private readonly datingRepository: Repository<Dating>
    ) {}

    public async getProfileInfoByUuid(uuid: string): Promise<User | null> {
        return await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.photos', 'photos')
            .where('uuid = :uuid', {uuid})
            .getOne();
    }

    public async getDatingProfileForUser(user: User, next = false, skipUserUuid?: string): Promise<User | null>
    {
        if (user.settings === undefined) {
            user.settings = await this.settingsRepository.findOne({user});
        }
        let condition = 'user.id != :current_user_id AND datingTo.fromUser IS NULL';
        let parameters = {'current_user_id': user.id};
        if (user.settings.showGender !== null) {
            condition += ' AND profile.gender = :showing_gender';
            parameters['showing_gender'] = user.settings.showGender;
        }
        if (skipUserUuid !== undefined) {
            condition += ' AND user.uuid != :skip_uuid';
            parameters['skip_uuid'] = skipUserUuid;
        }

        const nextProfile = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.photos', 'photos')
            .leftJoin('user.datingTo', 'datingTo', 'datingTo.fromUser = :current_user_id')
            .where(condition, parameters)
            .getOne();

        if (next) {
            if (nextProfile !== undefined) {
                await this.datingRepository.save({fromUser: user, toUser: nextProfile});
            }
            if (skipUserUuid !== undefined) {
                const skippedUser = await this.userRepository.findOne({uuid: skipUserUuid});
                if (skippedUser !== undefined) {
                    const contact = await this.datingRepository.findOne({fromUser: user, toUser: skippedUser});
                    if (contact === undefined) {
                        await this.datingRepository.save({fromUser: user, toUser: skippedUser});
                    }
                }
            }
        }

        return nextProfile ?? null;
    }
}