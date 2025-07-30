import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  }
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server : Server;
  
  constructor(
    private messagesService : MessagesService,
  ){}

  afterInit(server: Server) {
      console.log('websocket gateway initialized');
  }
    
  handleConnection(client: Socket, ...args: any[]) {
      console.log(`client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket){
      console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage( client: Socket, payload: { content: string; sender: string }): Promise<void>{ 
    console.log('mensaje recibido', payload);
    
    const message = await this.messagesService.createMessage(payload.content, payload.sender);
    this.server.emit('newMessage', message);
  }

  @SubscribeMessage('requestAllMessages')
  async handleRequestAllMessages(client: Socket): Promise<void>{
    console.log("dentro de todos los mensajes")
    const message = await this.messagesService.getAllMessages();
    client.emit('allMessages', message);
  }
}