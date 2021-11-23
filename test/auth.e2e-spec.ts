import {HttpStatus, INestApplication, ValidationPipe} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {Connection} from "typeorm";
import {AppModule} from "../src/app.module";
import {User} from "../src/auth/user.entity";
import {loadFixtures, send, testInvalidResponse, testUnauthorized} from "./utils";
import {RoutesUrls} from "../src/api/api.router";
import supertest from "supertest";
import * as bcrypt from "bcrypt";
import {HttpErrorCodes} from "../src/api/api.http";

let app: INestApplication;
let mod: TestingModule;
let connection: Connection;

const userData = {
    email: 'user1@mail.com',
    password: 'test',
    retypedPassword: 'test',
    firstName: 'User',
    lastName: 'First'
};

const testAuthData = (response: supertest.Response) => {
    expect(response.statusCode).toBe(HttpStatus.CREATED);
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
};

// npm run test:e2e -i auth.e2e-spec.ts
describe('Auth (e2e)', function () {
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

    describe('Successful registration', () => {
        it('Should return a new user with a correct token', async () => {
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, userData)
                .then(async response => {
                    testAuthData(response);

                    // Get user from DB
                    const createdUser = await connection.getRepository(User).findOne(1);
                    // Check password
                    expect(await bcrypt.compare(userData.password, createdUser.password)).toBeTruthy();
                    // Check data
                    expect(createdUser.email).toBe(userData.email);
                    expect(createdUser.firstName).toBe(userData.firstName);
                    expect(createdUser.lastName).toBe(userData.lastName);
                });
        });
    });

    describe('Unsuccessful registration', () => {
        it('Should return 422 status on password and retypedPassword mismatch', async () => {
            const invalidData = {...userData, retypedPassword: 'invalid_password'};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 1, HttpStatus.UNPROCESSABLE_ENTITY);
                });
        });

        it('Should return status 400 on sending the empty "email" in user data', async () => {
            let invalidData = {...userData, email: undefined};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 2);
                });
        });

        it('Should return status 400 on sending the empty "password" in user data', async () => {
            let invalidData = {...userData, password: undefined};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 3);
                });
        });

        it('Should return status 400 on sending the empty "retypedPassword" in user data', async () => {
            let invalidData = {...userData, retypedPassword: undefined};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 3);
                });
        });

        it('Should return status 400 on sending the invalid "email" in user data', async () => {
            let invalidData = {...userData, email: "invalid@email"};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return status 400 on sending the short "password" in user data', async () => {
            let invalidData = {...userData, password: '123'};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return status 400 on sending the integer "password" in user data', async () => {
            let invalidData = {...userData, password: 123};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 2);
                });
        });

        it('Should return status 400 on sending the short "retypedPassword" in user data', async () => {
            let invalidData = {...userData, retypedPassword: '123'};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return status 400 on sending the integer "retypedPassword" in user data', async () => {
            let invalidData = {...userData, retypedPassword: 123};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 2);
                });
        });

        it('Should return status 400 on sending the short "firstName" in user data', async () => {
            let invalidData = {...userData, firstName: 'T'};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return status 400 on sending the integer "firstName" in user data', async () => {
            let invalidData = {...userData, firstName: 123};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 2);
                });
        });

        it('Should return status 400 on sending the short "lastName" in user data', async () => {
            let invalidData = {...userData, lastName: 'T'};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return status 400 on sending the integer "lastName" in user data', async () => {
            let invalidData = {...userData, lastName: 123};
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, invalidData)
                .then(response => {
                    testInvalidResponse(response, 2);
                });
        });

        it('Should return 409 status on trying register user with existed email', async () => {
            loadFixtures(connection, '1-user.sql');

            const newUserData = {
                email: userData.email,
                password: 'new_password',
                retypedPassword: 'new_password',
                firstName: 'NewUser',
                lastName: 'NewFirst'
            }
            return send(app.getHttpServer(), RoutesUrls.AUTH_REGISTRATION, newUserData)
                .then(response => {
                    testInvalidResponse(response, 1, HttpStatus.CONFLICT);
                });
        });
    });

    describe('Successful login', () => {
        const loginData = {username: userData.email, password: userData.password};

        it('Should return user ingo with token', async () => {
            await loadFixtures(connection, '1-user.sql');

            return send(app.getHttpServer(), RoutesUrls.AUTH_LOGIN, loginData)
                .then(response => {
                    testAuthData(response);
                });
        });
    });

    describe('Unsuccessful login', () => {
        const loginData = {username: userData.email, password: userData.password};

        it('Should return status 401 on incorrect login', async () => {
            await loadFixtures(connection, '1-user.sql');
            const invalidData = {...loginData, username: 'invalid_user@mail.com'};

            return send(app.getHttpServer(), RoutesUrls.AUTH_LOGIN, invalidData)
                .then(response => {
                    testUnauthorized(response, HttpErrorCodes.UNAUTHORIZED);
                });
        });

        it('Should return status 401 on incorrect password', async () => {
            await loadFixtures(connection, '1-user.sql');
            const invalidData = {...loginData, password: 'invalid_password'};

            return send(app.getHttpServer(), RoutesUrls.AUTH_LOGIN, invalidData)
                .then(response => {
                    testUnauthorized(response, HttpErrorCodes.UNAUTHORIZED);
                });
        });
    });
});