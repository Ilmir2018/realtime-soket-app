import { UnauthorizedException } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { ConnectionUserI } from 'src/chat/models/connected-user.interface';
import { PageI } from 'src/chat/models/page.interface';
import { RoomI } from 'src/chat/models/room.interface';
import { ConnectedUserService } from 'src/chat/service/connected-user/connected-user.service';
import { RoomService } from 'src/chat/service/room-service/room.service';
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
    private roomService: RoomService,
    private connectedUserService: ConnectedUserService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    try {
      const decodedToken = await this.authService.verifyJwt(
        socket.handshake.headers.authorization,
      );
      const user: UserI = await this.userService.getOne(decodedToken.user.id);
      if (!user) {
        return this.disconnect(socket);
      } else {
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id, {
          page: 1,
          limit: 10,
        });

        //this is for angualr-material paginator
        rooms.meta.currentPage = rooms.meta.currentPage - 1;

        await this.connectedUserService.create({ socketId: socket.id, user });

        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch {
      return this.disconnect(socket);
    }
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  async handleDisconnect(socket: Socket) {
    //remove connection from DB
    await this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(soket: Socket, room: RoomI) {
    const createdRoom: RoomI = await this.roomService.createRoom(
      room,
      soket.data.user,
    );
    for (const user of createdRoom.users) {
      const connections: ConnectionUserI[] =
        await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id, {
        page: 1,
        limit: 10,
      });
      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }
  }

  @SubscribeMessage('paginateRooms')
  async onPaginateRoom(socket: Socket, page: PageI) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    //this is for angualr-material paginator
    page.page = page.page + 1;
    // console.log(socket.data);
    if (socket.data.user !== undefined) {
      const rooms = await this.roomService.getRoomsForUser(
        socket.data.user.id,
        page,
      );
      //this is for angualr-material paginator
      rooms.meta.currentPage = rooms.meta.currentPage - 1;
      return this.server.to(socket.id).emit('rooms', rooms);
    }
  }
}
