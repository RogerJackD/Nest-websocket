import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Socket } from "dgram";


export const WsUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const client: Socket = ctx.switchToWs().getClient<Socket>();
        return client['user'];
    }
)