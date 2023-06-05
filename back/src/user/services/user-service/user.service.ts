import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

import { map, switchMap } from 'rxjs/operators';

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

  login(user: UserI): Observable<string> {
    return this.findByEmail(user.email).pipe(
      switchMap((foundUser: UserI) => {
        if (foundUser) {
          return this.validatePassword(user.password, foundUser.password).pipe(
            switchMap((matches: boolean) => {
              if (matches) {
                return this.findOne(foundUser.id).pipe(
                  switchMap((payload: UserI) =>
                    this.authService.generateJwt(payload),
                  ),
                );
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
    return this.authService.comparePassword(passsword, stroredPasswordHash);
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
    return this.authService.hashPassword(password);
  }

  public getOne(id: any): Promise<UserI> {
    return this.userRepository.findOneOrFail({ where: { id } });
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
