import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, WsException } from '@nestjs/websockets';
import { PollsWsService } from './polls-ws.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { BaseGateway } from 'src/common/gateways/base.gateway';

//connect - disconnect
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JoinPollRoomDto } from './dto/join-poll-room.dto';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/common/guards/ws-auth.guard';


@WebSocketGateway({ namespace: 'polls' })
@UseGuards(WsAuthGuard)
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
  async votePoll(@ConnectedSocket() client: Socket, @MessageBody() votePollDto: VotePollDto){
    
    const roomName = `poll-${votePollDto.pollId}`;

    if(!client.rooms.has(roomName)) throw new WsException(`You must be in room : ${votePollDto.pollId} before voting`);

    const pollUpdated = await this.pollsWsService.votePoll(votePollDto);
    this.server.to(roomName)
      .emit('pollUpdated', pollUpdated);

  }

  @SubscribeMessage('joinPollRoom')
  async joinPoll(@ConnectedSocket() client: Socket,@MessageBody() joinPollRoomDto: JoinPollRoomDto){

    const roomName = `poll-${joinPollRoomDto.pollId}`;

    if(client.rooms.has(roomName)) throw new WsException(`You already in room : ${joinPollRoomDto.pollId}`);

    const pollFound = await this.pollsWsService.findOne(joinPollRoomDto.pollId);
    client.join(`poll-${joinPollRoomDto.pollId}`);
    client.broadcast.to(`poll-${joinPollRoomDto.pollId}`).emit('newUserJoinRoom',{ message: `new user in the ROOM ${joinPollRoomDto.pollId} : client: ${client.id}` })
    client.emit('welcomePollRoom',{message: `WELCOME the question is: ${pollFound.question} options: ${pollFound.options}`})
  }

  @SubscribeMessage('leavePollRoom')
  async leavePoll(@ConnectedSocket() client: Socket,@MessageBody() dto: JoinPollRoomDto){

    const roomName = `poll-${dto.pollId}`;

    if(!client.rooms.has(roomName)) throw new WsException(`You are not in room : ${dto.pollId}`);

    client.leave(roomName);
    this.server.to(`poll-${dto.pollId}`).emit('byeUserRoom',{ message: `the user ${client.id} LEFT THE ROOM` })
    client.emit('leftPollRoom',{
      message: `bye bye user you left room ${dto.pollId}`,
    })
  }

}
