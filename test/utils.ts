import {HttpStatus, INestApplication, Logger} from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import * as sendRequest from 'supertest';
import { Connection } from "typeorm";
import { ApiRouter, RoutesUrls, HttpMethods } from "../src/api/api.router";
import supertest, {Response, Test} from "supertest";
import {HttpErrorCodes} from "../src/api/api.http";
import { AuthService } from "../src/auth/auth.service";
import {User} from "../src/auth/user.entity";
import {TokenEntityDto} from "../src/auth/output/token.entity.dto";

const logger = new Logger('e2e');
const router = new ApiRouter();

export const loadFixtures = async (connection: Connection, sqlFileName: string) => {
    const sql = fs.readFileSync(path.join(__dirname, 'fixtures', sqlFileName), 'utf8');
    const queryRunner = connection.driver.createQueryRunner('master');

    for (const c of sql.split(';')) {
        await queryRunner.query(c);
    }
};

export const send = async (httpServer: any, route: RoutesUrls|[RoutesUrls, {}], params = {}, headers = {}): Promise<Response> => {
    let routeParams = {};
    if (Array.isArray(route)) {
        [route, routeParams] = route;
    }

    let result;
    const request = router.createRequest(route, routeParams);
    const httpRequest = sendRequest(httpServer);
    const token = params['token'] ?? null;

    let logMessage = `Make request ${request.method} ${request.uri}`;
    logger.debug(logMessage);
    //console.log(logMessage);

    switch (request.method) {
        case HttpMethods.GET:
            result = httpRequest.get(request.uri);
            break;
        case HttpMethods.POST:
            result = httpRequest.post(request.uri);
            break;
        case HttpMethods.PUT:
            result = httpRequest.put(request.uri);
            break;
        case HttpMethods.PATCH:
            result = httpRequest.patch(request.uri);
            break;
        case HttpMethods.DELETE:
            result = httpRequest.delete(request.uri);
            break;
    }

    if (token !== null) {
        logMessage = `Set token: ${token}`;
        logger.debug(logMessage);
        //console.log(logMessage);
        result.set('Authorization', `Bearer ${token}`)
    }
    return result.send(params);
}

export const tokenForUser = (
    app: INestApplication,
    user: Partial<User> = {
        id: 1,
        email: 'user1@mail.com'
    }
): TokenEntityDto => {
    return app.get(AuthService).getTokenForUser(user as User);
}

export const testUnauthorized = (response: supertest.Response, errorCode?: HttpErrorCodes) => {
    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBeDefined();
    expect(typeof response.body.message).toBe('string');
    if (errorCode !== undefined) {
        expect(response.body.message).toBe(errorCode);
    }
}

export const testInvalidResponse = (response: supertest.Response, errorsCount = 0, httpStatus = HttpStatus.BAD_REQUEST) => {
    expect(response.statusCode).toBe(httpStatus);
    expect(response.body.message).toBeDefined();
    expect(typeof response.body.message).toBe('object');
    expect(response.body.error).toBeDefined();
    if (errorsCount > 0) {
        expect(response.body.message.length).toBe(errorsCount);
    }
}

export const testNotFoundResponse = (response: supertest.Response) => {
    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body.message).toBeDefined();
    expect(typeof response.body.message).toBe('string');
    expect(response.body.error).toBeDefined();
    expect(typeof response.body.error).toBe('string');
}