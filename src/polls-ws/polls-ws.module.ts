import { Module } from '@nestjs/common';
import { PollsWsService } from './polls-ws.service';
import { PollsWsGateway } from './polls-ws.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './entities/polls.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [PollsWsGateway, PollsWsService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Poll])
  ]
})
export class PollsWsModule {}
