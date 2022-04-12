import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import ormConfig from './config/orm.config';
import {AuthModule} from "./auth/auth.module";
import {ProfileModule} from "./profile/profile.module";
import {DatingModule} from "./dating/dating.module";
import {PublicModule} from "./public/public.module";
import {ChatGateway} from "./chat/chat.gateway";
import {LoggerService} from "./service/logger.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [ormConfig],
            expandVariables: true, // Allows to do something like "SUPPORT_EMAIL=support@${APP_URL}" in .env.dev file
            envFilePath: `.env.${process.env.NODE_ENV}` // This variable is set in package.json file (scripts.start:dev section for example)
        }),
        TypeOrmModule.forRootAsync({useFactory: ormConfig}),
        AuthModule,
        ProfileModule,
        DatingModule,
        PublicModule
    ],
    controllers: [AppController],
    providers: [AppService, ChatGateway, LoggerService],
})
export class AppModule {
}
