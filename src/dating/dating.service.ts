import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import {ContactType, Contact} from "./contact.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../auth/user.entity";

@Injectable()
export class DatingService {
    constructor(
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

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