import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { RoomEntity } from './models/room.entity';
import { RoomService } from './service/room-service/room/room.service';

@Module({
  imports: [AuthModule, UserModule, TypeOrmModule.forFeature([RoomEntity])],
  providers: [ChatGateway, RoomService],
  exports: [RoomService],
})
export class ChatModule {}
