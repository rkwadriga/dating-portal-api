import { INestApplication, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import * as sendRequest from 'supertest';
import { Connection } from "typeorm";
import { ApiRouter, RoutesUrls, HttpMethods } from "../src/api/api.router";
import supertest, {Response, Test} from "supertest";

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

export const login = async (httpServer: any, username = 'user1@mail.com', password = 'test'): Promise<string> => {
    return await send(httpServer, RoutesUrls.AUTH_LOGIN, {username, password}).then(response => response.body.token);
}