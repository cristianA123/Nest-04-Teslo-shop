import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';



@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,

    private readonly jwtService: JwtService,
  ) {}

  // client.join('ventas') -> crear una sala
  // this.wss.emit('ventas').emit('')

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string

    let payload: JwtPayload

    try {
      
      payload = this.jwtService.verify( token )
      await this.messagesWsService.registerClient( client, payload.id )

    } catch (error) {
      client.disconnect()
      return ;
    }



    // notificar a todos
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }
  
  
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient( client.id )
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  @SubscribeMessage('message-form-client')
  handleMessageFormClient(client: Socket, payload: NewMessageDto) {
    
    // // Solo se envia al cliente que emitio
    // client.emit('message-form-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no message'
    // })

    // // Emitir a todos menos al cliente inicial
    // client.broadcast.emit('message-form-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no message'
    // })

     // Emitir a todos 
     this.wss.emit('message-form-server', {
      fullName: this.messagesWsService.getUserFullName( client.id),
      message: payload.message || 'no message'
    })

    //  this.wss.to(clienteID) -> para enviar a un usuario en particular o a una sala

  }



}
