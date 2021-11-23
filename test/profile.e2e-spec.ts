import {HttpStatus, INestApplication, ValidationPipe} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {Connection} from "typeorm";
import {AppModule} from "../src/app.module";
import {User} from "../src/auth/user.entity";
import {loadFixtures, send, testInvalidResponse, testNotFoundResponse, testUnauthorized, tokenForUser} from "./utils";
import {RoutesUrls} from "../src/api/api.router";
import supertest from "supertest";
import * as bcrypt from "bcrypt";
import {HttpErrorCodes} from "../src/api/api.http";

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

const updateData = {
    email: 'updated_user1@mail.com',
    password: 'updated_test',
    retypedPassword: 'updated_test',
    firstName: 'updated_User',
    lastName: 'updated_First'
}

const testProfileInfo = (response: supertest.Response, user = {firstName: user1.firstName, lastName: user1.lastName}) => {
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body.firstName).toBeDefined();
    expect(response.body.firstName).toBe(user.firstName);
    expect(response.body.lastName).toBeDefined();
    expect(response.body.lastName).toBe(user.lastName);
};

const testMeInfo = (response: supertest.Response, user = user1) => {
    testProfileInfo(response, {firstName: user.firstName, lastName: user.lastName});
    expect(response.body.email).toBeDefined();
    expect(response.body.email).toBe(user.email);
};

const invalidToken = 'eyJhbGciDfghIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSrtgzZXIxQG1haWw4529tIiwic3ViIjoxLCJpYXQRf6E2Mzc2NjIzMzcsImV4cCI6MTY0MDI1NDMzN30.6RvqbyV5Fxv8cHkK2ZpimI2sTz492ZAsNd4p-EgERSx';

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
        it('Should return current user\'s profile by ID', async () => {
            await loadFixtures(connection, '2-users.sql');
            const token = tokenForUser(app).accessToken;
            return send(app.getHttpServer(), [RoutesUrls.PROFILE_INFO, {id: 1}], {token})
                .then(response => {
                    testMeInfo(response);
                });
        });

        it('Should return other user\'s profile by ID', async () => {
            await loadFixtures(connection, '2-users.sql');
            const token = tokenForUser(app).accessToken;
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
                    testUnauthorized(response, HttpErrorCodes.UNAUTHORIZED);
                });
        });

        it('Should return 401 status on getting profile with invalid token', async () => {
            return send(app.getHttpServer(), [RoutesUrls.PROFILE_INFO, {id: 1}], {token: invalidToken})
                .then(response => {
                    testUnauthorized(response, HttpErrorCodes.INVALID_TOKEN);
                });
        });

        it('Should return a 404 status on getting profile by incorrect ID', async () => {
            await loadFixtures(connection, '2-users.sql');
            const token = tokenForUser(app).accessToken;

            return send(app.getHttpServer(), [RoutesUrls.PROFILE_INFO, {id: 111}], {token})
                .then(response => {
                    testNotFoundResponse(response);
                });
        });
    });
    
    describe('Successful update profile', () => {
        it('Should return an updated info after updating profile', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...updateData, token})
                .then(async response => {
                    // Check if info changed in response
                    testMeInfo(response, updateData);

                    // Get user from DB
                    const changedUser = await connection.getRepository(User).findOne(1);

                    // Check if password changed
                    expect(await bcrypt.compare(user1.password, changedUser.password)).toBeFalsy();
                    expect(await bcrypt.compare(updateData.password, changedUser.password)).toBeTruthy();

                    // Check if info changed in DB
                    expect(changedUser.email).toBe(updateData.email);
                    expect(changedUser.firstName).toBe(updateData.firstName);
                    expect(changedUser.lastName).toBe(updateData.lastName);
                });
        });
    });

    describe('Unsuccessful update profile', () => {
        it('Should return 401 status on trying update profile without without authentication', async () => {
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, updateData)
                .then(response => {
                    testUnauthorized(response, HttpErrorCodes.UNAUTHORIZED);
                });
        });

        it('Should return 401 status on trying update profile with invalid token', async () => {
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...updateData, token: invalidToken})
                .then(response => {
                    testUnauthorized(response, HttpErrorCodes.INVALID_TOKEN);
                });
        });

        it('Should return 422 status on password and retypedPassword mismatch', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            const invalidData = {...updateData, retypedPassword: 'invalid_password'};

            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 1, HttpStatus.UNPROCESSABLE_ENTITY);
                });
        });

        it('Should return status 400 on sending the empty "email" in user data', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            let invalidData = {...updateData, email: ''};
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return status 400 on sending the empty "password" in user data', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            let invalidData = {...updateData, password: ''};
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return status 400 on sending the empty "retypedPassword" in user data', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            let invalidData = {...updateData, retypedPassword: undefined};
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 1, HttpStatus.UNPROCESSABLE_ENTITY);
                });
        });

        it('Should return status 400 on sending the invalid "email" in user data', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            let invalidData = {...updateData, email: "invalid@email"};
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return status 400 on sending the short "password" in user data', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            let invalidData = {...updateData, password: '123'};
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return status 400 on sending the integer "password" in user data', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            let invalidData = {...updateData, password: 123};
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 2);
                });
        });

        it('Should return status 400 on sending the short "retypedPassword" in user data', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            let invalidData = {...updateData, retypedPassword: '123'};
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return status 400 on sending the integer "retypedPassword" in user data', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            let invalidData = {...updateData, retypedPassword: 123};
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 2);
                });
        });

        it('Should return status 400 on sending the short "firstName" in user data', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            let invalidData = {...updateData, firstName: 'T'};
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return status 400 on sending the integer "firstName" in user data', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            let invalidData = {...updateData, firstName: 123};
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 2);
                });
        });

        it('Should return status 400 on sending the short "lastName" in user data', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            let invalidData = {...updateData, lastName: 'T'};
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 1);
                });
        });

        it('Should return status 400 on sending the integer "lastName" in user data', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            let invalidData = {...updateData, lastName: 123};
            return send(app.getHttpServer(), RoutesUrls.PROFILE_UPDATE, {...invalidData, token})
                .then(response => {
                    testInvalidResponse(response, 2);
                });
        });
    });

    describe('Successful delete profile', () => {
        it('Should return 401 status after deleting', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            return send(app.getHttpServer(), RoutesUrls.PROFILE_DELETE, {token})
                .then(response => {
                    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
                    expect(response.body).toMatchObject({});
                    return send(app.getHttpServer(), [RoutesUrls.PROFILE_INFO, {id: 1}], {token})
                        .then(response => {
                            testUnauthorized(response, HttpErrorCodes.UNAUTHORIZED);
                        });
                });
        });

        it('Should delete record from DB', async () => {
            await loadFixtures(connection, '1-user.sql');
            const token = tokenForUser(app).accessToken;
            return send(app.getHttpServer(), RoutesUrls.PROFILE_DELETE, {token})
                .then(async response => {
                    // Get user from DB
                    const deletedUser = await connection.getRepository(User).findOne(1);
                    expect(deletedUser).toBeUndefined();
                });
        });
    });

    describe('Unsuccessful delete profile', () => {
        it('Should return 401 status on deleting without authentication', async () => {
            await loadFixtures(connection, '1-user.sql');
            return send(app.getHttpServer(), RoutesUrls.PROFILE_DELETE)
                .then(async response => {
                    testUnauthorized(response);
                });
        });
    });
});