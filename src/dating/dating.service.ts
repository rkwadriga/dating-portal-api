import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import {ContactType, Contact} from "./contact.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../auth/user.entity";
import {Photo} from "../profile/photo.entity";

@Injectable()
export class DatingService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>,
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>,
    ) { }

    public async getPairs(forUser: User): Promise<User[]> {
        return await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.photos', 'photos', 'photos.isAvatar = true')
            .innerJoin('user.contactTo', 'to', 'to.fromUser = :current_user_id AND to.type = :type_like')
            .innerJoin('user.contactFrom', 'from', 'from.toUser = :current_user_id AND from.type = :type_like')
            .setParameters({
                'current_user_id': forUser.id,
                'type_like': ContactType.LIKE
            })
            .where('user.id != :current_user_id')
            .getMany();
    }

    public async like(fromUser: User, toUserUuid: string) {
        if (fromUser.uuid === toUserUuid) {
            throw new Error('You can not luke yourself');
        }

        const toUser = await this.userRepository.findOne({uuid: toUserUuid});
        if (toUser === null) {
            throw new Error(`User ${toUserUuid} not found`);
        }

        let contact = await this.contactRepository.findOne({fromUser, toUser});
        if (contact === undefined) {
            await this.contactRepository.save({fromUser, toUser, type: ContactType.LIKE});
            return;
        }

        await this.contactRepository.save(Object.assign(contact, {type: ContactType.LIKE}));
    }

    public async clearContactsForUser(user: User) {
        await this.contactRepository
            .createQueryBuilder()
            .delete()
            .where(
                'fromUserId = :current_user_id AND isPair = false',
                {'current_user_id': user.id}
            )
            .execute();
    }
}