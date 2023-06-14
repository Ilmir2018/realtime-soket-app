import { RoomI } from 'src/chat/models/room/room.interface';

export interface UserI {
  id?: number;
  username?: string;
  email: string;
  password?: string;
  rooms?: RoomI[];
}
