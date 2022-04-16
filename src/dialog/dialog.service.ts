import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import {Message} from "./message.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {WsMessage} from "../chat/chat.gateway";
import {v4 as uuidv4} from 'uuid';
import {User} from "../auth/user.entity";

export interface Dialog {
    count: number,
    messages: Message[]
}

@Injectable()
export class DialogService {
    private readonly defaultMessagesLimit = Number(process.env.DEFAULT_CHAT_MESSAGES_LIMIT)

    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    public async writeMessage(message: WsMessage): Promise<Message> {
        // Check the message params
        if (!message.text) {
            throw new Error('Param "msg" cna not be empty');
        }
        if (!message.from) {
            throw new Error('Param "from" cna not be empty');
        }
        if (!message.to) {
            throw new Error('Param "to" cna not be empty');
        }

        // Find the sender and the recipient users
        const sender = await this.userRepository.findOne({uuid: message.from});
        if (sender === undefined) {
            throw new Error(`Can not find the sender by uuid "${message.from}"`);
        }
        const recipient = await this.userRepository.findOne({uuid: message.to});
        if (recipient === undefined) {
            throw new Error(`Can not find the recipient by uuid "${message.to}"`);
        }

        return await this.messageRepository.save({
            uuid: uuidv4(),
            text: message.text,
            time: message.time ?? new Date(),
            fromUser: sender,
            toUser: recipient
        });
    }

    public async getDialog(forUser: User, withUserUuid: string, limit: number | null = null, offset = 0): Promise<Dialog> {
        if (limit === null) {
            limit = this.defaultMessagesLimit;
        }
        const partner = await this.userRepository.findOne({uuid: withUserUuid});
        if (partner === undefined) {
            throw new Error(`User #${withUserUuid} not found`);
        }

        let request = this.messageRepository.createQueryBuilder('m')
            .addSelect(['fromU.uuid', 'toU.uuid'])
            .leftJoin('m.fromUser', 'fromU')
            .leftJoin('m.toUser', 'toU')
            .orderBy('m.time', 'DESC')
            .where('(m.fromUserId = :user_id AND m.toUserId = :partner_id) OR ' +
                '(m.fromUserId = :partner_id AND m.toUserId = :user_id)',
            {
                    'user_id': forUser.id,
                    'partner_id': partner.id
                });

        const count = await request.getCount();
        if (count === 0) {
            return {count: 0, messages: []};
        }

        if (limit > 0) {
            request.limit(limit);
        }
        if (offset > 0) {
            request.offset(offset);
        }

        return {
            count,
            messages: await request.getMany()
        };
    }
}