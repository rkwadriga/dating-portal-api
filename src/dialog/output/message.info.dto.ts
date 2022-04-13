import {Expose} from "class-transformer";
import {Message} from "../message.entity";

export class MessageInfoDto {
    @Expose()
    id: string;

    @Expose()
    from: string;

    @Expose()
    to: string;

    @Expose()
    time: Date;

    @Expose()
    text: string;

    constructor(message: Message) {
        this.id = message.uuid;
        this.from = message.fromUser.uuid;
        this.to = message.toUser.uuid;
        this.time = message.time;
        this.text = message.text;
    }
}