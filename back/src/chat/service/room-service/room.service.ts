import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { RoomEntity } from 'src/chat/models/room/room.entity';
import { RoomI } from 'src/chat/models/room/room.interface';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
  ) {}

  async createRoom(room: RoomI, creator: UserI): Promise<RoomI> {
    const newRoom = await this.addCreatorToRoom(room, creator);
    return this.roomRepository.save(newRoom);
  }

  async getRoom(roomId: number): Promise<RoomI> {
    return await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['users'],
    });
  }

  async getRoomsForUser(
    userId: number,
    options: IPaginationOptions,
  ): Promise<Pagination<RoomI>> {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'user')
      .orderBy('room.created_at', 'ASC');

    return paginate<RoomI>(query, options);
  }

  async addCreatorToRoom(room: RoomI, creator: UserI): Promise<RoomI> {
    room.users.push(creator);
    return room;
  }
}
