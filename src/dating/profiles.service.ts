import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { User } from "../auth/user.entity";
import { Repository } from "typeorm";
import { Photo } from "../profile/photo.entity";
import { Settings } from "../profile/settings.entity";
import { Contact, ContactType } from "./contact.entity";
import { addYears, DATE_FORMAT, formatDate } from "../helpers/time.helper";

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
        const contacts = await this.contactRepository.createQueryBuilder('c')
            .where({fromUser: forUser, toUser: profile, type: ContactType.LIKE})
            .orWhere({fromUser: profile, toUser: forUser, type: ContactType.LIKE})
            .getMany();

        let [outLike, inLike] = [false, false];
        contacts.forEach(contact => {
            if (contact.fromUserId === forUser.id) {
                outLike = true;
            } else if (contact.toUserId === forUser.id) {
                inLike = true;
            }
        });

        profile.isLiked = outLike;
        profile.isPair = outLike && inLike;

        return profile;
    }

    public async getDatingProfileForUser(user: User, next = false): Promise<User | null>
    {
        if (user.settings === undefined) {
            user.settings = await this.settingsRepository.findOne({user});
        }

        // Get only users who are not seen yet
        let condition = 'user.id != :current_user_id AND contactTo.fromUser IS NULL';
        let parameters = {'current_user_id': user.id};

        // Filter by gender
        if (next && user.settings.showGender !== null) {
            condition += ' AND profile.gender = :showing_gender';
            parameters['showing_gender'] = user.settings.showGender;
        }

        // Filter by age
        if (next && (user.settings.showAgeFrom !== null || user.settings.showAgeTo !== null)) {
            condition += ' AND profile.birthday ';
            let [from, to] = [null, null];
            if (user.settings.showAgeFrom !== null) {
                from = parameters['date_from'] = formatDate(addYears(-user.settings.showAgeFrom), DATE_FORMAT);
            }
            if (user.settings.showAgeTo !== null) {
                to = parameters['date_to'] = formatDate(addYears(-(user.settings.showAgeTo + 1)), DATE_FORMAT);
            }

            if (from !== null && to !== null) {
                condition += 'BETWEEN :date_to AND :date_from'
            } else if (from !== null) {
                condition += '<= :date_from';
            } else if (to !== null) {
                condition += '>= :date_to';
            }
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