import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';

@Module({
  providers: [MessagesService],
  imports: [
    TypeOrmModule.forFeature([
      Message
    ])
  ],
  exports: [MessagesService]
})
export class MessagesModule {}
