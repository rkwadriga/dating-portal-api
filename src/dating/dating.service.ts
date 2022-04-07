import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import {ContactType, Dating} from "./dating.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../auth/user.entity";

@Injectable()
export class DatingService {
    constructor(
        @InjectRepository(Dating)
        private readonly datingRepository: Repository<Dating>,
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

        let contact = await this.datingRepository.findOne({fromUser, toUser});
        if (contact === undefined) {
            await this.datingRepository.save({fromUser, toUser, type: ContactType.LIKE});
            return;
        }

        await this.datingRepository.save(Object.assign(contact, {type: ContactType.LIKE}));
    }

    public async clearDatingsForUser(user: User) {
        await this.datingRepository
            .createQueryBuilder()
            .delete()
            .where(
                'fromUserId = :current_user_id AND isPair = false',
                {'current_user_id': user.id}
            )
            .execute();
    }
}