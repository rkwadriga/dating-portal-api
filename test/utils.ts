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
    const sql = fs.readFileSync(
        path.join(__dirname, 'fixtures', sqlFileName),
        'utf8'
    );

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

    const request = router.createRequest(route, routeParams);
    const result = sendRequest(httpServer);

    const logMessage = `Make request ${request.method} ${request.uri}`;
    logger.debug(logMessage);
    //console.log(logMessage);

    switch (request.method) {
        case HttpMethods.GET:
            return result.get(request.uri).send(params);
        case HttpMethods.POST:
            return result.post(request.uri).send(params);
        case HttpMethods.PUT:
            return result.put(request.uri).send(params);
        case HttpMethods.PATCH:
            return result.patch(request.uri).send(params);
        case HttpMethods.DELETE:
            return result.delete(request.uri).send();
    }
}