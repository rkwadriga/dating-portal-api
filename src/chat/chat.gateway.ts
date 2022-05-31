import { Injectable } from "@nestjs/common";
import { ConnectionData, SocketService } from "../service/socket.service";
import { IncomingMessage as WsRequest } from "http";
import { LoggerService, LogsPaths } from "../service/logger.service";
import { DialogService } from "../dialog/dialog.service";

export interface WsMessage {
    id: string;
    from: string;
    to: string;
    text: string;
    time?: Date
}

@Injectable()
export class ChatGateway {
    private connections: {[key: string]: WebSocket} = {};

    constructor(
        private readonly socketService: SocketService,
        private readonly dialogService: DialogService,
        private readonly logger: LoggerService
    ) {
        this.logger.setPath(LogsPaths.CHAT);
        this.init();
    }

    private init() {
        this.socketService.onConnect().subscribe(connection => this.onConnected(connection));
        this.socketService.onClose().subscribe(connection => this.onClose(connection));
        this.socketService.onMessage = (event: MessageEvent) => {
            this.onMessage(JSON.parse(event.data));
        };
    }

    private onConnected(data: ConnectionData): void {
        const clientID = ChatGateway.getClientID(data.request);
        if (clientID === null) {
            this.logError('Invalid connection request: client ID missed');
            return;
        }
        this.connections[clientID] = data.connection;
        this.logInfo(`Client #${clientID} connected`);
    }

    private onClose(data: ConnectionData): void {
        const clientID = ChatGateway.getClientID(data.request);
        if (clientID === null || this.connections[clientID] === undefined) {
            return;
        }
        this.connections[clientID] = undefined;
        this.logInfo(`Client #${clientID} disconnected`);
    }

    private async onMessage(message: WsMessage) {
        // Check message
        if (!message.from || !message.to || !message.text) {
            this.logError(`Invalid message: "${JSON.stringify(message)}"`);
            return;
        }
        if (message.time === undefined) {
            message.time = new Date();
        }
        this.logInfo(`Message from ${message.from} tp ${message.to}: "${message.text}"`);

        // Write message to DB
        try {
            const dbMessage = await this.dialogService.writeMessage(message);
            message.id = dbMessage.uuid;
        } catch (e) {
            this.logError(`Can not write message ${JSON.stringify(message)} to DB: ${e.message}`);
        }

        // Send message to user if he is connected
        if (this.connections[message.to] !== undefined) {
            this.connections[message.to].send(JSON.stringify(message));
        }
    }

    private static getClientID(request: WsRequest): string | null {
        const matches = request.url.match(/client=([\w-]+)/);
        return matches[1] ?? null;
    }

    private logInfo(message: string, context?: any) {
        this.logger.info(message, context);
    }

    private logError(message: string, context?: any) {
        this.logger.error(message, context);
    }
}
