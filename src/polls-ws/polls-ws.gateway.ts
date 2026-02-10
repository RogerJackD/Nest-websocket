import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { PollsWsService } from './polls-ws.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { BaseGateway } from 'src/common/gateways/base.gateway';

//conect - disconect
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class PollsWsGateway extends BaseGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private connectedClients: Map<string, string> = new Map();

  constructor(
    private readonly pollsWsService: PollsWsService,
  ) {
    super()
  }

  

  handleConnection(client: any, ...args: any[]) {
    this.connectedClients.set(client.id, 'anonymous');
    this.server.emit('listenClientConnected', `new client connect: ${client.id}`)
    this.server.emit('onlineCountUsers', this.connectedClients.size);
    client.emit('welcome', {
    yourId: client.id,
    onlineUsers: this.connectedClients.size,
  });
  }
  
  handleDisconnect(client: any) {
    this.connectedClients.delete(client.id);
    this.server.emit('onlineCountUsers', this.connectedClients.size);
    this.server.emit('listenClientDisconnected', `bye bye : ${client.id}`)
  }

  // TODO: CHECK LOGS POSTMAN IT DONT WORKS
  @SubscribeMessage('getInitialData')
  getInitialData(@ConnectedSocket() client: Socket) {
    return {
      event: 'welcome',
      data: {
        yourId: client.id,
        onlineUsers: this.connectedClients.size,
      },
    };
  }

  @SubscribeMessage('createPoll')
  create(@MessageBody() createPollDto: CreatePollDto) {
    return this.pollsWsService.create(createPollDto);
  }

  @SubscribeMessage('findAllPoll')
  findAll() {
    return this.pollsWsService.findAll();
  }
  
  @SubscribeMessage('findOnePoll')
  findOne(@MessageBody() id: number) {
    return this.pollsWsService.findOne(id);
  }

  @SubscribeMessage('updatePoll')
  update(@MessageBody() updatePollDto: UpdatePollDto) {
    return this.pollsWsService.update(updatePollDto)
  }

  @SubscribeMessage('removePoll')
  remove(@MessageBody() id: number) {
    return this.pollsWsService.remove(id);
  }

  @SubscribeMessage('votePoll')
  async votePoll(@MessageBody() VotePollDto: VotePollDto){
    const updatedPoll = await this.pollsWsService.votePoll(VotePollDto);
    this.server.emit('PollUpdated', updatedPoll)
  }
}
