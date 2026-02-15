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
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { WsUser } from 'src/common/decorators/ws-user.decorator';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';


@WebSocketGateway({ namespace: 'polls' })
@UseGuards(WsAuthGuard, RolesGuard)
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

  @Roles(Role.ADMIN)
  @SubscribeMessage('createPoll')
  create(@MessageBody() createPollDto: CreatePollDto) {
    return this.pollsWsService.create(createPollDto);
  }

  @Roles(Role.ADMIN)
  @SubscribeMessage('removePoll')
  remove(@MessageBody() id: number) {
    return this.pollsWsService.remove(id);
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
  async joinPoll(@ConnectedSocket() client: Socket, @WsUser() user: JwtPayload, @MessageBody() joinPollRoomDto: JoinPollRoomDto){

    const roomName = `poll-${joinPollRoomDto.pollId}`;

    if(client.rooms.has(roomName)) throw new WsException(`You already in room : ${joinPollRoomDto.pollId}`);

    const pollFound = await this.pollsWsService.findOne(joinPollRoomDto.pollId);
    client.join(`poll-${joinPollRoomDto.pollId}`);
    client.broadcast.to(`poll-${joinPollRoomDto.pollId}`).emit('newUserJoinRoom',{ message: `new user in the ROOM ${joinPollRoomDto.pollId} : client: ${client.id} user: ${user.email} - role: ${user.role}` })
    client.emit('welcomePollRoom',{message: `WELCOME: ${client.id, '-' , user.email} the question is: ${pollFound.question} options: ${pollFound.options}`})
  }

  @SubscribeMessage('leavePollRoom')
  async leavePoll(@ConnectedSocket() client: Socket, @WsUser() user: JwtPayload, @MessageBody() dto: JoinPollRoomDto){

    const roomName = `poll-${dto.pollId}`;

    if(!client.rooms.has(roomName)) throw new WsException(`You are not in room : ${dto.pollId}`);

    client.leave(roomName);
    this.server.to(`poll-${dto.pollId}`).emit('byeUserRoom',{ message: `the user with id socket: ${client.id} - user id: ${user.id} LEFT THE ROOM` })
    client.emit('leftPollRoom',{
      message: `bye bye user you left room ${dto.pollId}`,
    })
  }

}
