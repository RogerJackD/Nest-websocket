import { ArgumentsHost, BadRequestException } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

export class WsExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost){
        
        if( exception instanceof BadRequestException ){
            const response = exception.getResponse();

            const wsException = new WsException( response );
            super.catch( wsException, host );
            return
        }
        
        super.catch(exception, host);
    }
}