import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Role } from "../enums/role.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { Socket } from "dgram";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class RolesGuard implements CanActivate{

    //leer metadata ROLES_KEY
    constructor(
        private readonly reflector : Reflector,
    ){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY , [
            context.getHandler(), //Lee la metadata guardada por el decorador @Roles(). Busca en el handler sino encuentra busca en la clase array de roles o undefined
            context.getClass(),
        ]);

        //theren't roles added
        if( !requiredRoles ) return true;

        const client: Socket = context.switchToWs().getClient<Socket>();
        //get the user client (WsAuthGuard already put it data client)
        const user = client['user'];
        if( !user ) throw new WsException('Unauthorized: No user found');

        //verify if user has the role(s)
        const hasRole = requiredRoles.includes(user.role);
        if( !hasRole ) throw new WsException('Forbidden: insufficient permissions');

        //usar has the rol: allow access
        return true

    }
}