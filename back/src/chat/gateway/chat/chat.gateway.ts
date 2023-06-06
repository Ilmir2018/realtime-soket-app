import { UnauthorizedException } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { UserI } from 'src/user/model/user.interface';
import { UserService } from 'src/user/services/user-service/user.service';

@WebSocketGateway({
  cors: {
    origin: ['https://hoppscotch.io', 'http://localhost:4200'],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  title: string[] = [];

  async handleConnection(socket: Socket) {
    try {
      const decodedToken = await this.authService.verifyJwt(
        socket.handshake.headers.authorization,
      );
      const user: UserI = await this.userService.getOne(decodedToken.user.id);
      if (!user) {
        return this.disconnect(socket);
      } else {
        this.title.push('Value ' + Math.random().toString());
        this.server.emit('message', this.title);
      }
    } catch {
      return this.disconnect(socket);
    }
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  handleDisconnect(socket: Socket) {
    socket.disconnect();
  }
}
