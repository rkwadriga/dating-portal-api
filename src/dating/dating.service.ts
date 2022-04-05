import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import {Dating} from "./dating.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../auth/user.entity";

@Injectable()
export class DatingService {
    constructor(
        @InjectRepository(Dating)
        private readonly datingRepository: Repository<Dating>
    ) { }

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