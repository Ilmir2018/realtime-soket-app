import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinedRoomEntity } from 'src/chat/models/joined-room/joined-room.entity';
import { JoinedRoomI } from 'src/chat/models/joined-room/joined-room.inerface';
import { RoomI } from 'src/chat/models/room/room.interface';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class JoinedRoomService {
  constructor(
    @InjectRepository(JoinedRoomEntity)
    private readonly joinedRoomRepository: Repository<JoinedRoomEntity>,
  ) {}

  async create(joinedRoom: JoinedRoomI): Promise<JoinedRoomI> {
    return this.joinedRoomRepository.save(joinedRoom);
  }

  async findByUser(user: UserI): Promise<JoinedRoomI[]> {
    return this.joinedRoomRepository.find({
      where: {
        user: user,
      },
    });
  }

  async findByRoom(id: any): Promise<JoinedRoomI[]> {
    return this.joinedRoomRepository.findBy({ room: id });
  }

  async deleteBySocketId(socketId: string) {
    await this.joinedRoomRepository.delete({ socketId });
  }

  async deleteAll() {
    await this.joinedRoomRepository.createQueryBuilder().delete().execute();
  }
}
