import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs';
import { RoomI, RoomPaginateI } from 'src/app/models/room.interface';
import { UserI } from 'src/app/models/user.interface';
import { CustomSocket } from '../../sokets/custom-socket';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private socket: CustomSocket) {}

  sendMessage(msg: string) {
    this.socket.emit('message', msg);
  }
  getMessage() {
    return this.socket.fromEvent('message');
  }

  getMyRooms() {
    return this.socket.fromEvent<RoomPaginateI>('rooms');
  }

  createRoom() {
    const user: UserI = {
      id: 1,
    };

    const room: RoomI = {
      name: 'TestRoom',
      users: [user],
    };

    this.socket.emit('createRoom', room);
  }
}
