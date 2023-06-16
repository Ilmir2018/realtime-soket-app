import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { ConnectionUserI } from 'src/chat/models/connected-user/connected-user.interface';
import { JoinedRoomI } from 'src/chat/models/joined-room/joined-room.inerface';
import { MessageI } from 'src/chat/models/message/message.interface';
import { PageI } from 'src/chat/models/page.interface';
import { RoomI } from 'src/chat/models/room/room.interface';
import { ConnectedUserService } from 'src/chat/service/connected-user/connected-user.service';
import { JoinedRoomService } from 'src/chat/service/joined-room/joined-room.service';
import { MessageService } from 'src/chat/service/message/message.service';
import { RoomService } from 'src/chat/service/room-service/room.service';
import { UserI } from 'src/user/model/user.interface';
import { UserService } from 'src/user/services/user-service/user.service';

@WebSocketGateway({
  cors: {
    origin: ['https://hoppscotch.io', 'http://localhost:4200'],
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private roomService: RoomService,
    private connectedUserService: ConnectedUserService,
    private joinedRoomService: JoinedRoomService,
    private messageService: MessageService,
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

  async onModuleInit() {
    await this.connectedUserService.deleteAll();
    await this.joinedRoomService.deleteAll();
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
      //substract page -1 to match the angular material paginator
      rooms.meta.currentPage = rooms.meta.currentPage - 1;
      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }
  }

  @SubscribeMessage('paginateRooms')
  async onPaginateRoom(socket: Socket, page: PageI) {
    if (socket.data.user !== undefined) {
      const rooms = await this.roomService.getRoomsForUser(
        socket.data.user.id,
        this.handleIncomingPageRequest(page),
      );
      //this is for angualr-material paginator
      rooms.meta.currentPage = rooms.meta.currentPage - 1;
      return this.server.to(socket.id).emit('rooms', rooms);
    }
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(socket: Socket, room: RoomI) {
    //find messages to rurrent room
    const messages = await this.messageService.findMessagesForRoom(room, {
      limit: 10,
      page: 1,
    });
    messages.meta.currentPage = messages.meta.currentPage - 1;
    //Save connection to room
    await this.joinedRoomService.create({
      socketId: socket.id,
      user: socket.data.user,
      room,
    });
    //send last messages from room to user
    await this.server.to(socket.id).emit('messages', messages);
  }

  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(socket: Socket) {
    //remove connection from joinedRooms
    await this.joinedRoomService.deleteBySocketId(socket.id);
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: MessageI) {
    const createdMessage: MessageI = await this.messageService.create({
      ...message,
      user: socket.data.user,
    });
    const room: RoomI = await this.roomService.getRoom(createdMessage.room.id);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(
      room,
    );
    //TODO: send new message to all joined users of the room (currently online)
  }

  private handleIncomingPageRequest(page: PageI): PageI {
    page.limit = page.limit > 100 ? 100 : page.limit;
    //this is for angualr-material paginator
    page.page = page.page + 1;
    return page;
  }
}
