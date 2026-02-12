import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { PollsWsService } from './polls-ws.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { BaseGateway } from 'src/common/gateways/base.gateway';

//connect - disconnect
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JoinPollRoomDto } from './dto/join-poll-room.dto';

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

  //test room 
  @SubscribeMessage('votePoll')
  async votePoll(@MessageBody() votePollDto: VotePollDto){
    const pollUpdated = await this.pollsWsService.votePoll(votePollDto);
    this.server.to(`poll-${votePollDto.pollId}`)
      .emit('pollUpdated', pollUpdated);

  }

  @SubscribeMessage('joinPollRoom')
  async joinPoll(@ConnectedSocket() client: Socket,@MessageBody() joinPollRoomDto: JoinPollRoomDto){
    const pollFound = await this.pollsWsService.findOne(joinPollRoomDto.pollId);
    client.join(`poll-${joinPollRoomDto.pollId}`);
    this.server.to(`poll-${joinPollRoomDto.pollId}`).emit('welcomePollRoom',{
      message: `a user just join : client : ${client.id}`,
      poll: `${pollFound.question} options : ${pollFound.options}`
    })
  }

  @SubscribeMessage('leavePollRoom')
  async leavePoll(@ConnectedSocket() client: Socket,@MessageBody() dto: JoinPollRoomDto){
    client.leave(`poll-${dto.pollId}`)
    client.emit('leftPollRoom',{
      message: `bye bye user you left room ${dto.pollId}`,
    })
  }

}
