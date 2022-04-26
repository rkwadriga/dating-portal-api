import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ormConfig from './config/orm.config';
import { AuthModule } from "./auth/auth.module";
import { ProfileModule } from "./profile/profile.module";
import { DatingModule } from "./dating/dating.module";
import { PublicModule } from "./public/public.module";
import { LoggerService } from "./service/logger.service";
import { DialogModule } from "./dialog/dialog.module";
import { DialogService } from "./dialog/dialog.service";
import { Message } from "./dialog/message.entity";
import { User } from "./auth/user.entity";
import { SocketService } from "./service/socket.service";
import { ChatGateway } from "./chat/chat.gateway";
import { FileSystemService } from "./service/fileSystem.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [ormConfig],
            expandVariables: true, // Allows to do something like "SUPPORT_EMAIL=support@${APP_URL}" in .env.dev file
            envFilePath: `.env.${process.env.NODE_ENV}` // This variable is set in package.json file (scripts.start:dev section for example)
        }),
        TypeOrmModule.forRootAsync({useFactory: ormConfig}),
        TypeOrmModule.forFeature([User, Message]),
        AuthModule,
        ProfileModule,
        DatingModule,
        PublicModule,
        DialogModule
    ],
    controllers: [AppController],
    providers: [AppService, LoggerService, DialogService, SocketService, ChatGateway, FileSystemService],
})
export class AppModule {
}
