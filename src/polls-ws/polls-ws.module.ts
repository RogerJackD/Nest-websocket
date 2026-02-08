import { Module } from '@nestjs/common';
import { PollsWsService } from './polls-ws.service';
import { PollsWsGateway } from './polls-ws.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './entities/polls.entity';

@Module({
  providers: [PollsWsGateway, PollsWsService],
  imports: [
    TypeOrmModule.forFeature([Poll])
  ]
})
export class PollsWsModule {}
