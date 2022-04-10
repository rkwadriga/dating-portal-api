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

    public async getProfileInfoByUuid(uuid: string, forUser: User | null = null): Promise<User | null> {
        const profile = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.photos', 'photos')
            .where('uuid = :uuid', {uuid})
            .getOne();

        if (profile !== undefined && forUser !== null) {
            const pair = await this.userRepository.createQueryBuilder('u')
                .select('u.id')
                .innerJoin('u.contactTo', 'to', 'to.fromUser = :current_user_id AND to.type = :type_like')
                .innerJoin('u.contactFrom', 'from', 'from.toUser = :current_user_id AND from.type = :type_like')
                .where('u.id = :profile_id')
                .setParameters({
                    'profile_id': profile.id,
                    'current_user_id': forUser.id,
                    'type_like': ContactType.LIKE
                })
                .getOne();

            profile.isPair = pair !== undefined;
        }

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