import {HttpStatus, INestApplication, ValidationPipe} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {Connection} from "typeorm";
import {AppModule} from "../src/app.module";
import {User} from "../src/auth/user.entity";
import {loadFixtures, send, testInvalidResponse, testUnauthorized, tokenForUser} from "./utils";
import {RoutesUrls} from "../src/api/api.router";
import supertest from "supertest";
import * as bcrypt from "bcrypt";
import {HttpErrorCodes} from "../src/api/api.http";
import {JwtService} from "@nestjs/jwt";

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

const testAuthData = (response: supertest.Response, httpCode = HttpStatus.CREATED) => {
    expect(response.statusCode).toBe(httpCode);
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
    expect(typeof response.body.token).toBe('object');
    expect(response.body.token.accessToken).toBeDefined();
    expect(typeof response.body.token.accessToken).toBe('string');
    expect(response.body.token.accessToken.length).toBeGreaterThanOrEqual(100);
    expect(response.body.token.refreshToken).toBeDefined();
    expect(typeof response.body.token.refreshToken).toBe('string');
    expect(response.body.token.refreshToken.length).toBeGreaterThanOrEqual(100);
    expect(response.body.token.accessToken === response.body.token.refreshToken).toBeFalsy();
};

const expiredAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIxQG1haWwuY29tIiwic3ViIjoxLCJzaWduYXR1cmUiOiJhY2Nlc3NfdG9rZW46MTYzNzY4ODQ1MTY5NSIsImlhdCI6MTYzNzY4ODQ1MSwiZXhwIjoxNjM3Njg4NTExfQ.0LDPdgGjiuc4fRBodx6UxzvCdxSUTBzmiNlnaEfE1JM';
const expiredRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIxQG1haWwuY29tIiwic3ViIjoxLCJzaWduYXR1cmUiOiJyZWZyZXNoX3Rva2VuOjE2Mzc2ODg0NTE2OTUiLCJpYXQiOjE2Mzc2ODg0NTEsImV4cCI6MTYzNzY4ODYzMX0.cT5KvEb209oqGRcvsIxYLemGkTwf_YKFWBS4h0hadWc';
const invalidToken = 'eyJhbGciDfghIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSrtgzZXIxQG1haWw4529tIiwic3ViIjoxLCJpYXQRf6E2Mzc2NjIzMzcsImV4cCI6MTY0MDI1NDMzN30.6RvqbyV5Fxv8cHkK2ZpimI2sTz492ZAsNd4p-EgERSx';

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

    describe('Successful refresh token', () => {
        it('Should return a new token on refresh', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app);

            return send(app.getHttpServer(), RoutesUrls.AUTH_REFRESH_TOKEN, token)
                .then(response => {
                    testAuthData(response, HttpStatus.OK);
                    expect(response.body.token.accessToken === token.accessToken).toBeFalsy();
                    expect(response.body.token.refreshToken === token.refreshToken).toBeFalsy();
                });
        });

        it('Should rerun a 401 status on expired token sent', async () => {
            await loadFixtures(connection, '1-user.sql');

            return send(app.getHttpServer(), [RoutesUrls.PROFILE_INFO, {id: 1}], {token: expiredAccessToken})
                .then(response => {
                    testUnauthorized(response, HttpErrorCodes.EXPIRED_TOKEN);
                });
        });
    });

    describe('Unsuccessful refresh token', () => {
        it('Should return 401 status on trying refresh an invalid token', async () => {
            await loadFixtures(connection, '1-user.sql');
            let token = tokenForUser(app);
            token.accessToken = invalidToken;

            return send(app.getHttpServer(), RoutesUrls.AUTH_REFRESH_TOKEN, token)
                .then(response => {
                    testUnauthorized(response, HttpErrorCodes.INVALID_TOKEN);
                });
        });

        it('Should return 401 status on trying refresh with incorrect refreshToken', async () => {
            await loadFixtures(connection, '1-user.sql');
            let token = tokenForUser(app);
            token.accessToken = expiredAccessToken;

            return send(app.getHttpServer(), RoutesUrls.AUTH_REFRESH_TOKEN, token)
                .then(response => {
                    testUnauthorized(response, HttpErrorCodes.INVALID_TOKEN);
                });
        });

        it('Should return 401 status on trying refresh with expired refreshToken', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = {accessToken: expiredAccessToken, refreshToken: expiredRefreshToken};

            return send(app.getHttpServer(), RoutesUrls.AUTH_REFRESH_TOKEN, token)
                .then(response => {
                    testUnauthorized(response, HttpErrorCodes.EXPIRED_TOKEN);
                });
        });

        it('Should return 401 status on trying refresh without accessToken', async () => {
            await loadFixtures(connection, '1-user.sql');
            let token = tokenForUser(app);
            token.accessToken = undefined;

            return send(app.getHttpServer(), RoutesUrls.AUTH_REFRESH_TOKEN, token)
                .then(response => {
                    testUnauthorized(response, HttpErrorCodes.UNAUTHORIZED);
                });
        });

        it('Should return 400 status on trying refresh without refreshToken', async () => {
            await loadFixtures(connection, '1-user.sql');
            let token = tokenForUser(app);
            token.refreshToken = undefined;

            return send(app.getHttpServer(), RoutesUrls.AUTH_REFRESH_TOKEN, token)
                .then(response => {
                    testInvalidResponse(response, 3);
                });
        });

        it('Should return 401 status on trying refresh with short accessToken', async () => {
            await loadFixtures(connection, '1-user.sql');
            let token = tokenForUser(app);
            token.accessToken = "abcde";

            return send(app.getHttpServer(), RoutesUrls.AUTH_REFRESH_TOKEN, token)
                .then(response => {
                    testUnauthorized(response, HttpErrorCodes.INVALID_TOKEN);
                });
        });

        it('Should return 401 status on trying refresh with integer accessToken', async () => {
            await loadFixtures(connection, '1-user.sql');
            let token = tokenForUser(app);

            return send(app.getHttpServer(), RoutesUrls.AUTH_REFRESH_TOKEN, {...token, accessToken: 123})
                .then(response => {
                    testUnauthorized(response, HttpErrorCodes.INVALID_TOKEN);
                });
        });

        it('Should return 400 status on trying refresh with short refreshToken', async () => {
            await loadFixtures(connection, '1-user.sql');
            let token = tokenForUser(app);
            token.refreshToken = "abcde";

            return send(app.getHttpServer(), RoutesUrls.AUTH_REFRESH_TOKEN, token)
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return 400 status on trying refresh with integer refreshToken', async () => {
            await loadFixtures(connection, '1-user.sql');
            let token = tokenForUser(app);

            return send(app.getHttpServer(), RoutesUrls.AUTH_REFRESH_TOKEN, {...token, refreshToken: 123})
                .then(response => {
                    testInvalidResponse(response, 2);
                });
        });
    });
});