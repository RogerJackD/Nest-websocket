import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { Observable } from "rxjs";

@Injectable()
export class WsAuthGuard implements CanActivate{
    constructor(
        private readonly jwtService: JwtService,
    ){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const client: Socket = context.switchToWs().getClient<Socket>();
        const tokenParam = client.handshake.query.token;
        const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

        if(!token) throw new WsException('Unauthorized: No token provided');

        try {
            const payload = this.jwtService.verify(token);
            client['user'] = payload;
            return true
        } catch (error) {
            throw new WsException('Unauthorized: invalid token'); 
        }
    }
}