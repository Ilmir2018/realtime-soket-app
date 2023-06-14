import { UserI } from 'src/user/model/user.interface';

export interface ConnectionUserI {
  id?: number;
  socketId: string;
  user: UserI;
}
