import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import {User} from "../auth/user.entity";
import {Photo} from "../profile/photo.entity";

export default (): TypeOrmModuleOptions => ({
    type: 'mysql',
    //host: '172.17.0.1',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        User,
        Photo
    ],
    synchronize: true,
    dropSchema: Boolean(parseInt(process.env.DB_DROP_SCHEMA))
});