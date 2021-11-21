import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Connection } from "typeorm";
import { AppModule } from "../src/app.module";
import { User } from "../src/auth/user.entity";
import { loadFixtures as loadFixturesBase, send } from "./utils";
import { RoutesUrls } from "../src/api/api.router";
import {type} from "os";

let app: INestApplication;
let mod: TestingModule;
let connection: Connection;

const loadFixtures = async (sqlFileName: string) =>
    loadFixturesBase(connection, sqlFileName);

describe('Auth (e2e) ', function () {
    beforeEach(async () => {
        mod = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = mod.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());

        await app.init();

        connection = app.get(Connection);
    });

    afterEach(async () => {
        await app.close();
    });

    it('Should return a new user with a correct token', async () => {
        return await send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, {
                "email": "user3@mail.com",
                "password": "test",
                "retypedPassword": "test",
                "firstName": "User",
                "lastName": "Third"
            })
            .then(response => {
                console.log(response.statusCode, response.body, response.error);
            });
    });
});