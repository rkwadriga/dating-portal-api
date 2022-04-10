import {InjectRepository} from "@nestjs/typeorm";
import {Injectable} from "@nestjs/common";
import {User} from "../auth/user.entity";
import {Repository} from "typeorm";
import {Photo} from "../profile/photo.entity";
import {Settings} from "../profile/settings.entity";
import {Contact, ContactType} from "./contact.entity";

@Injectable()
export class ProfilesService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>,
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>,
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>
    ) {}

    public async getProfileInfoByUuid(uuid: string, forUser: User): Promise<User | null> {
        // Get target profile
        const profile = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.photos', 'photos')
            .where('uuid = :uuid', {uuid})
            .getOne();

        // Get like contact from just liked account
        const pairContact = await this.contactRepository.createQueryBuilder('c')
            .select('c.type')
            .innerJoin(Contact, 'cc', 'cc.fromUserId = c.toUserId AND cc.toUserId = c.fromUserId AND cc.type = c.type')
            .where({fromUser: profile, toUser: forUser, type: ContactType.LIKE})
            .getOne();

        profile.isPair = pairContact !== undefined;
        profile.photos = [];

        return profile;
    }

    public async getDatingProfileForUser(user: User, next = false): Promise<User | null>
    {
        if (user.settings === undefined) {
            user.settings = await this.settingsRepository.findOne({user});
        }
        let condition = 'user.id != :current_user_id AND contactTo.fromUser IS NULL';
        let parameters = {'current_user_id': user.id};
        if (user.settings.showGender !== null) {
            condition += ' AND profile.gender = :showing_gender';
            parameters['showing_gender'] = user.settings.showGender;
        }

        const nextProfile = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.photos', 'photos')
            .leftJoin('user.contactTo', 'contactTo', 'contactTo.fromUser = :current_user_id')
            .where(condition, parameters)
            .getOne();

        if (next && nextProfile !== undefined) {
            await this.contactRepository.save({fromUser: user, toUser: nextProfile});
        }

        return nextProfile ?? null;
    }
}