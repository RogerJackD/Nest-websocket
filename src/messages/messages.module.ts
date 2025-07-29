import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';

@Module({
  providers: [MessagesGateway, MessagesService],
  imports: [
    TypeOrmModule.forFeature([
      Message
    ])
  ]
})
export class MessagesModule {}
