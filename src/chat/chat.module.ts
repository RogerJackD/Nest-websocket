import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "src/messages/entities/message.entity";
import { ChatGateway } from "./chat.gateway";
import { MessagesService } from "src/messages/messages.service";


@Module({
    imports: [ TypeOrmModule.forFeature([ Message ])],
    providers: [ ChatGateway, MessagesService ]
})
export class ChatModule{}