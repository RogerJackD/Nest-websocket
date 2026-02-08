import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { PollsWsService } from './polls-ws.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { Server } from 'socket.io';
import { VotePollDto } from './dto/vote-poll.dto';

@WebSocketGateway()
export class PollsWsGateway {
  constructor(
    private readonly pollsWsService: PollsWsService,
  ) { }


  @WebSocketServer()
  server: Server;
  // @UsePipes(new ValidationPipe({
  //   whitelist: true,
  //   exceptionFactory: (errors) => {
  //     return new WsException(errors);
  //   },
  // }))
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
