import {HttpStatus, INestApplication, ValidationPipe} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {Connection} from "typeorm";
import {AppModule} from "../src/app.module";
import {User} from "../src/auth/user.entity";
import {loadFixtures, send, login} from "./utils";
import {RoutesUrls} from "../src/api/api.router";
import {response} from "express";
import supertest from "supertest";

let app: INestApplication;
let mod: TestingModule;
let connection: Connection;

const user1 = {
    email: 'user1@mail.com',
    password: 'test',
    retypedPassword: 'test',
    firstName: 'User',
    lastName: 'First'
};

const user2 = {
    email: 'user2@mail.com',
    password: 'test',
    retypedPassword: 'test',
    firstName: 'User',
    lastName: 'Second'
};

// npm run test:e2e -i profile.e2e-spec.ts
describe('Profile (e2e)', () => {
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

    describe('Successful getting info', () => {
        const testProfileInfo = (response: supertest.Response, user = {firstName: user1.firstName, lastName: user1.lastName}) => {
            expect(response.statusCode).toBe(HttpStatus.OK);
            expect(response.body.firstName).toBeDefined();
            expect(response.body.firstName).toBe(user.firstName);
            expect(response.body.lastName).toBeDefined();
            expect(response.body.lastName).toBe(user.lastName);
        };

        it('Should return current user\'s profile by ID', async () => {
            await loadFixtures(connection, '2-users.sql');
            const token = await login(app.getHttpServer());

            return send(app.getHttpServer(), [RoutesUrls.PROFILE_INFO, {id: 1}], {token})
                .then(response => {
                    testProfileInfo(response);
                    expect(response.body.email).toBeDefined();
                    expect(response.body.email).toBe(user1.email);
                });
        });

        it('Should return other user\'s profile by ID', async () => {
            await loadFixtures(connection, '2-users.sql');
            const token = await login(app.getHttpServer());

            return send(app.getHttpServer(), [RoutesUrls.PROFILE_INFO, {id: 2}], {token})
                .then(response => {
                    testProfileInfo(response, {firstName: user2.firstName, lastName: user2.lastName});
                    expect(response.body.email).toBeUndefined();
                });
        });
    });

    describe('Unsuccessful getting info', () => {
        it('Should return 401 status on getting profile without authorization', async () => {
            return send(app.getHttpServer(), [RoutesUrls.PROFILE_INFO, {id: 1}])
                .then(response => {
                    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
                    expect(response.body.message).toBeDefined();
                    expect(typeof response.body.message).toBe('string');
                });
        });

        it('Should return a 404 status on getting profile by incorrect ID', async () => {
            await loadFixtures(connection, '2-users.sql');
            const token = await login(app.getHttpServer());

            return send(app.getHttpServer(), [RoutesUrls.PROFILE_INFO, {id: 111}], {token})
                .then(response => {
                    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
                    expect(response.body.message).toBeDefined();
                    expect(typeof response.body.message).toBe('string');
                    expect(response.body.error).toBeDefined();
                    expect(typeof response.body.error).toBe('string');
                });
        });
    });
});