import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectedUserEntity } from 'src/chat/models/connected-user.entity';
import { ConnectionUserI } from 'src/chat/models/connected-user.interface';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class ConnectedUserService {
  constructor(
    @InjectRepository(ConnectedUserEntity)
    private readonly connectedUserRepository: Repository<ConnectedUserEntity>,
  ) {}

  async create(connectedUser: ConnectionUserI): Promise<ConnectionUserI> {
    return this.connectedUserRepository.save(connectedUser);
  }

  async findByUser(user: UserI): Promise<ConnectionUserI[]> {
    return this.connectedUserRepository.find({
      where: {
        user: user,
      },
    });
  }

  async deleteBySocketId(socketId: string) {
    return this.connectedUserRepository.delete({ socketId });
  }
}
