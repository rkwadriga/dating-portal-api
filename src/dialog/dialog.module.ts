import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Message} from "./message.entity";
import {DialogService} from "./dialog.service";
import {DialogController} from "./dialog.controller";
import {LoggerService} from "../service/logger.service";
import {User} from "../auth/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Message, User])
    ],
    providers: [DialogService, LoggerService],
    controllers: [DialogController]
})
export class DialogModule {

}