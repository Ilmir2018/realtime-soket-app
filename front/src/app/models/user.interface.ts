import { RoomI } from './room.interface';

export interface UserI {
  id?: number;
  email?: string;
  password?: string;
  username?: string;
  rooms?: RoomI[];
}
