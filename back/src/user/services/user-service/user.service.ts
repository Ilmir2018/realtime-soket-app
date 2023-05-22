import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of } from 'rxjs';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

import { map, mapTo, switchMap } from 'rxjs/operators';

import * as bcryptjs from 'bcryptjs';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  create(newUser: UserI): Observable<any> {
    return this.mailExists(newUser.email).pipe(
      switchMap((exists: boolean) => {
        if (!exists) {
          return this.hashPassword(newUser.password).pipe(
            switchMap((passwordHash: string) => {
              newUser.password = passwordHash;
              return from(this.userRepository.save(newUser)).pipe(
                switchMap((user: UserI) => this.findOne(user.id)),
              );
            }),
          );
        } else {
          throw new HttpException(
            'Email is already in use',
            HttpStatus.CONFLICT,
          );
        }
      }),
    );
  }

  findAll(options: IPaginationOptions): Observable<Pagination<UserI>> {
    return from(paginate<UserEntity>(this.userRepository, options));
  }

  login(user: UserI): Observable<boolean> {
    return this.findByEmail(user.email).pipe(
      switchMap((foundUser: UserI) => {
        if (foundUser) {
          return this.validatePassword(user.password, foundUser.password).pipe(
            switchMap((matches: boolean) => {
              if (matches) {
                return this.findOne(foundUser.id).pipe(mapTo(true));
              } else {
                throw new HttpException(
                  'Login was not successful, wrong cridentials',
                  HttpStatus.UNAUTHORIZED,
                );
              }
            }),
          );
        } else {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
      }),
    );
  }

  private validatePassword(
    passsword: string,
    stroredPasswordHash: string,
  ): Observable<any> {
    return from(bcryptjs.compare(passsword, stroredPasswordHash));
  }

  private findByEmail(email: string): Observable<UserI> {
    return from(
      this.userRepository.findOne({
        where: { email },
        select: ['id', 'username', 'email', 'password'],
      }),
    );
  }

  private findOne(id: number): Observable<UserI> {
    return from(this.userRepository.findOneBy({ id }));
  }

  private hashPassword(password: string): Observable<string> {
    return from<string>(bcryptjs.hash(password, 12));
  }

  private mailExists(email: string): Observable<boolean> {
    return from(
      this.userRepository.findOne({
        where: {
          email,
        },
      }),
    ).pipe(
      map((user: UserI) => {
        if (user) {
          return true;
        } else {
          return false;
        }
      }),
    );
  }
}
