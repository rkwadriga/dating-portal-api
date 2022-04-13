import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import {Message} from "./message.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {WsMessage} from "../chat/chat.gateway";
import {v4 as uuidv4} from 'uuid';
import {User} from "../auth/user.entity";

@Injectable()
export class DialogService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    public async writeMessage(recipientID: string, message: WsMessage): Promise<Message> {
        // Check the message params
        if (!message.msg) {
            throw new Error('Param "msg" cna not be empty');
        }
        if (!message.client) {
            throw new Error('Param "client" cna not be empty');
        }

        // Find the sender and the recipient users
        const sender = await this.userRepository.findOne({uuid: message.client});
        if (sender === undefined) {
            throw new Error(`Can not find the sender by uuid "${message.client}"`);
        }
        const recipient = await this.userRepository.findOne({uuid: recipientID});
        if (recipient === undefined) {
            throw new Error(`Can not find the recipient by uuid "${recipientID}"`);
        }

        return await this.messageRepository.save({
            uuid: uuidv4(),
            text: message.msg,
            time: message.time ?? new Date(),
            fromUser: sender,
            toUser: recipient
        });
    }

    public async getDialog(forUser: User, withUserUuid: string): Promise<Message[]> {
        const partner = await this.userRepository.findOne({uuid: withUserUuid});
        if (partner === undefined) {
            throw new Error(`User #${withUserUuid} not found`);
        }

        return await this.messageRepository.createQueryBuilder('m')
            .addSelect(['fromU.uuid', 'toU.uuid'])
            .leftJoin('m.fromUser', 'fromU')
            .leftJoin('m.toUser', 'toU')
            .orderBy('m.time')
            .where('(m.fromUserId = :user_id AND m.toUserId = :partner_id) OR ' +
                '(m.fromUserId = :partner_id AND m.toUserId = :user_id)',
            {
                    'user_id': forUser.id,
                    'partner_id': partner.id
                })
            .getMany();
    }
}