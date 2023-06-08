import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { CreateUserDto } from 'src/user/model/dto/create-user.dto';
import { LoginUserDto } from 'src/user/model/dto/login-user.dto';
import { UserI } from 'src/user/model/user.interface';

@Injectable()
export class UserHelperService {
  createUserDtoToEntity(createUserDto: CreateUserDto): UserI {
    return {
      email: createUserDto.email,
      password: createUserDto.password,
      username: createUserDto.username,
    };
  }

  loginUserDtoToEntity(loginUserDto: LoginUserDto): UserI {
    return {
      email: loginUserDto.email,
      password: loginUserDto.password,
    };
  }
}
