import { Injectable } from "@nestjs/common";
import { Observable } from 'rxjs';
import { IncomingMessage } from "http";
import { LoggerService } from "./logger.service";
import { LogsPaths } from "../config/logger.config";

const WebSocketServer = require('ws');

export interface ConnectionData {
    connection: WebSocket,
    request: IncomingMessage
}

@Injectable()
export class SocketService {
    private transport: any;

    constructor(
        private readonly logger: LoggerService
    ) {
        this.transport = new WebSocketServer.Server({
            port: 9111
        });
    }

    public onConnect(): Observable<ConnectionData> {
        return new Observable<ConnectionData>(subscriber => {
            this.transport.on('connection', (connection: WebSocket, request: IncomingMessage) => {
                connection.onmessage = this.onMessage;
                subscriber.next({connection, request});
            });
        });
    }

    public onClose(): Observable<ConnectionData> {
        return new Observable<ConnectionData>(subscriber => {
            this.transport.on('close', (connection: WebSocket, request: IncomingMessage) => {
                subscriber.next({connection, request});
            });
        });
    }

    public onMessage(event: MessageEvent): void {
        this.logger.info('New socket message', LogsPaths.SOCKET, event.data)
    }
}