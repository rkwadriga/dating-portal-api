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
    client: string,
    msg: string,
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

        await this.sendMessageFrom(clientID, message);
    }

    private async sendMessageFrom(clientID: string, message: WsMessage) {
        // Check the sender and recipient IDs
        if (clientID === message.client) {
            this.logger.error('chat', `Client ${clientID} tries to send the message to himself`);
            return;
        }

        // Remember recipient ID
        const recipientID = message.client;

        // Change messages "client" to sender's ID
        message.client = clientID;
        this.logger.info('chat', `Message from ${clientID} to ${recipientID}: ${message.msg}`);

        // If recipient is connected - send massage just now. Else remember it to send it when he will return
        if (this.clients[recipientID] !== undefined) {
            this.clients[recipientID].emit('message', message);
        } else if(this.messages[recipientID] !== undefined) {
            this.messages[recipientID].push(message);
        }

        // Write message to database
        try {
            await this.dialogService.writeMessage(recipientID, message);
        } catch (e) {
            this.logger.error('chat', `Can not write a new message to user ${recipientID}: ${e.message}`, message);
        }
    }
}
