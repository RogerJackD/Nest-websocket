import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io'
import { WsExceptionFilter } from "../filters/ws-exceptions.filter";

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseFilters(new WsExceptionFilter())
export abstract class BaseGateway {
    @WebSocketServer()
    server: Server;
}