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

const userData = {
    email: 'user1@mail.com',
    password: 'test',
    retypedPassword: 'test',
    firstName: 'User',
    lastName: 'First'
};

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
        return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, userData)
            .then(response => {
                expect(response.statusCode).toBe(201);
                expect(response.body.id).toBeDefined();
                expect(response.body.id).toBe(1);
                expect(response.body.email).toBeDefined();
                expect(response.body.email).toBe(userData.email);
                expect(response.body.firstName).toBeDefined();
                expect(response.body.firstName).toBe(userData.firstName);
                expect(response.body.lastName).toBeDefined();
                expect(response.body.lastName).toBe(userData.lastName);
                expect(response.body.password).toBeUndefined();
                expect(response.body.retypedPassword).toBeUndefined();
                expect(response.body.token).toBeDefined();
                expect(response.body.token.length).toBeDefined();
                expect(response.body.token.length).toBeGreaterThanOrEqual(100);
            });
    });
});