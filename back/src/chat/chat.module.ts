import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { ConnectedUserEntity } from './models/connected-user/connected-user.entity';
import { JoinedRoomEntity } from './models/joined-room/joined-room.entity';
import { MessageEntity } from './models/message/message.entity';
import { RoomEntity } from './models/room/room.entity';
import { ConnectedUserService } from './service/connected-user/connected-user.service';
import { RoomService } from './service/room-service/room.service';
import { JoinedRoomService } from './service/joined-room/joined-room.service';
import { MessageService } from './service/message/message.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forFeature([
      RoomEntity,
      ConnectedUserEntity,
      MessageEntity,
      JoinedRoomEntity,
    ]),
  ],
  providers: [
    ChatGateway,
    RoomService,
    ConnectedUserService,
    JoinedRoomService,
    MessageService,
  ],
  exports: [RoomService],
})
export class ChatModule {}
