import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from 'src/user/model/user.interface';
import { Like, Repository } from 'typeorm';

import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/service/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  async create(newUser: UserI): Promise<any> {
    try {
      const exists: boolean = await this.mailExists(newUser.email);
      if (!exists) {
        const passwordHash: string = await this.hashPassword(newUser.password);
        newUser.password = passwordHash;
        const user = await this.userRepository.save(
          this.userRepository.create(newUser),
        );
        return this.findOne(user.id);
      } else {
        throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
      }
    } catch {
      throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
    }
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<UserI>> {
    return paginate<UserEntity>(this.userRepository, options);
  }

  async login(user: UserI): Promise<string> {
    try {
      const foundUser = await this.findByEmail(user.email.toLowerCase());
      if (foundUser) {
        const matches: boolean = await this.validatePassword(
          user.password,
          foundUser.password,
        );
        if (matches) {
          const payload: UserI = await this.findOne(foundUser.id);
          return this.authService.generateJwt(payload);
        } else {
          throw new HttpException(
            'Login was not successful, wrong cridentials',
            HttpStatus.UNAUTHORIZED,
          );
        }
      } else {
        throw new HttpException(
          'Login was not successful, wrong cridentials',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  private async validatePassword(
    passsword: string,
    stroredPasswordHash: string,
  ): Promise<any> {
    return this.authService.comparePassword(passsword, stroredPasswordHash);
  }

  private async findByEmail(email: string): Promise<UserI> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'password'],
    });
  }

  private async findOne(id: number): Promise<UserI> {
    return this.userRepository.findOneBy({ id });
  }

  private async hashPassword(password: string): Promise<string> {
    return this.authService.hashPassword(password);
  }

  public async getOne(id: any): Promise<UserI> {
    return this.userRepository.findOneOrFail({ where: { id } });
  }

  private async mailExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  async findAllByUsername(username: string): Promise<UserI[]> {
    return this.userRepository.find({
      where: {
        username: Like(`%${username.toLowerCase()}%`),
      },
    });
  }
}
