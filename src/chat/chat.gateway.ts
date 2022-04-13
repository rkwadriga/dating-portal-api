import {
    WebSocketGateway,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
} from "@nestjs/websockets";
import { Server } from "http";
import { Socket as Client } from "net";
import { LoggerService } from "../service/logger.service";
import {removeByIndex} from "../helpers/array.helper";
import {DialogService} from "../dialog/dialog.service";

export interface WsMessage {
    id: string;
    from: string;
    to: string;
    text: string;
    time?: Date
}

@WebSocketGateway(3001, {cors: true})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    clients: {[key: string]: Client} = {};
    messages: {[key: string]: WsMessage[]} = {};

    constructor(
        private readonly logger: LoggerService,
        private readonly dialogService: DialogService
    ) { }

    afterInit(server: any): any {
        //console.log('Server started');
    }

    handleConnection(client: Client): void {
        const clientID = client?.['handshake']?.['query']?.['client'];
        if (!clientID) {
            this.logger.error('chat', `Trying to connected without client ID: "${client?.['handshake']?.['url']}"`);
            return;
        }
        if (this.clients[clientID] === undefined) {
            this.clients[clientID] = client;
            this.logger.info('chat', `Client ${clientID} connected`);
        }

        if (this.messages[clientID] === undefined) {
            this.messages[clientID] = [];
        }
        this.messages[clientID].forEach((message, i) => {
            client.emit('message', message);
            removeByIndex(i, this.messages[clientID]);
        });
    }

    handleDisconnect(client: Client): void {
        const clientID = client?.['handshake']?.['query']?.['client'];
        if (clientID && this.clients[clientID] !== undefined) {
            this.clients[clientID] = undefined;
            this.logger.info('chat', `Client ${clientID} disconnected`);
        }
    }

    @SubscribeMessage('message')
    async handleMessage(@MessageBody() message: WsMessage, @ConnectedSocket() client: Client) {
        const clientID = client?.['handshake']?.['query']?.['client'];
        if (!clientID) {
            this.logger.error('chat', `Trying to send a message without client ID: "${client?.['handshake']?.['url']}"`);
            return;
        }
        // Check the sender and recipient IDs
        if (clientID === message.to) {
            this.logger.error('chat', `Client ${clientID} tries to send the message to himself`);
            return;
        }

        await this.sendMessage(message);
    }

    private async sendMessage(message: WsMessage) {

        this.logger.info('chat', `Message from ${message.from} to ${message.to}: ${message.text}`);

        // Write message to database
        try {
            const DbMessage = await this.dialogService.writeMessage(message);
            message.id = DbMessage.uuid;
        } catch (e) {
            this.logger.error('chat', `Can not write a new message to user ${message.to}: ${e.message}`, message);
            return;
        }

        // If recipient is connected - send massage just now. Else remember it to send it when he will return
        if (this.clients[message.to] !== undefined) {
            this.clients[message.to].emit('message', message);
        } else if(this.messages[message.to] !== undefined) {
            this.messages[message.to].push(message);
        }
    }
}
