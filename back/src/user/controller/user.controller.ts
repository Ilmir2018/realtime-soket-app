import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { UserI } from '../model/user.interface';
import { UserHelperService } from '../services/user-helper/user-helper.service';
import { UserService } from '../services/user-service/user.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseI } from '../model/login-response.interface';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private userHelperService: UserHelperService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<Pagination<UserI>> {
    limit = limit > 100 ? 100 : limit;
    return this.userService.findAll({
      page,
      limit,
      route: 'http://localhost:3000/back/users',
    });
  }

  @Get('/find-by-username')
  async findAllByUsername(@Query('username') username: string) {
    return this.userService.findAllByUsername(username);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserI> {
    const userEntity: UserI =
      this.userHelperService.createUserDtoToEntity(createUserDto);
    return this.userService.create(userEntity);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseI> {
    const userEntity: UserI =
      this.userHelperService.loginUserDtoToEntity(loginUserDto);
    const jwt: string = await this.userService.login(userEntity);
    return {
      access_token: jwt,
      token_type: 'JWT',
      expires_in: 3600,
    };
  }
}
