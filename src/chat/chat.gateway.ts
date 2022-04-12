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

interface Message {
    client: string,
    msg: string,
    time?: Date
}

@WebSocketGateway(3001, {cors: true})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    clients: {[key: string]: Client} = {};
    messages: {[key: string]: Message[]} = {};

    constructor(
        private readonly logger: LoggerService
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
        this.clients[clientID] = client;
        this.logger.info('chat', `Client ${clientID} connected`);

        if (this.messages[clientID] === undefined) {
            this.messages[clientID] = [];
        } else {
            this.messages[clientID].forEach((message, i) => {
                client.emit('message', message);
                removeByIndex(i, this.messages[clientID]);
            });
        }
    }

    handleDisconnect(client: Client): void {
        const clientID = client?.['handshake']?.['query']?.['client'];
        if (clientID && this.clients[clientID] !== undefined) {
            this.clients[clientID] = undefined;
            this.logger.info('chat', `Client ${clientID} disconnected`);
        }
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() message: Message, @ConnectedSocket() client: Client): void {
        const clientID = client?.['handshake']?.['query']?.['client'];
        if (!clientID) {
            this.logger.error('chat', `Trying to send a message without client ID: "${client?.['handshake']?.['url']}"`);
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
        } else {
            if (this.messages[recipientID] !== undefined) {
                this.messages[recipientID] = [];
            }
            this.messages[recipientID].push(message);
        }
    }
}
