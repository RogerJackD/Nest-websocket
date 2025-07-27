import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer()
    server: Server;

    
    handleConnection(client: any) {
        console.log(`cliente connect : ${client.id}`);
    }

    handleDisconnect(client: any) {
        console.log(`cliente disconnect : ${client.id}`);
    }

    @SubscribeMessage('mensaje')
    handleMessage(@ConnectedSocket() client: Socket,@MessageBody() data: any){
        console.log(data);
        //this.server.emit('mensajeserver', data)
        client.broadcast.emit('mensajeserver', data);
    }

    @SubscribeMessage('onNewUser')
    handleNewUser(@ConnectedSocket() client: Socket,@MessageBody() data: any){
        console.log(data);

        //conecta databse , etc
        //save user
        //read user, etc ...
        //this.server.emit('mensajeserver', data)
        client.broadcast.emit('onNewUser', data);
    }
}