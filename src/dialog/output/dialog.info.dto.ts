import {Expose} from "class-transformer";
import {MessageInfoDto} from "./message.info.dto";
import {Dialog} from "../dialog.service";

export class DialogInfoDto {
    @Expose()
    count: number;
    @Expose()
    messages: MessageInfoDto[];

    constructor(dialog: Dialog) {
        this.count = dialog.count;
        this.messages = [];
        dialog.messages.forEach(msg => {
            this.messages.push(new MessageInfoDto(msg));
        });
    }
}