import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { from, Observable, of } from 'rxjs';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { UserI } from '../model/user.interface';
import { UserHelperService } from '../services/user-helper/user-helper.service';
import { UserService } from '../services/user-service/user.service';
import { map, switchMap } from 'rxjs/operators';
import { Pagination } from 'nestjs-typeorm-paginate';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseI } from '../model/login-response.interface';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private userHelperService: UserHelperService,
  ) {
    // const foo$ = from([1, 2, 3, 4, 6]).pipe(map((item) => item * 10));
    // foo$.subscribe((item) => console.log(item));
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Observable<Pagination<UserI>> {
    limit = limit > 100 ? 100 : limit;
    return this.userService.findAll({
      page,
      limit,
      route: 'http://localhost:3000/back/users',
    });
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Observable<UserI> {
    return this.userHelperService
      .createUserDtoToEntity(createUserDto)
      .pipe(switchMap((user: UserI) => this.userService.create(user)));
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto): Observable<LoginResponseI> {
    return this.userHelperService.loginUserDtoToEntity(loginUserDto).pipe(
      switchMap((user: UserI) =>
        this.userService.login(user).pipe(
          map((jwt: string) => {
            return {
              access_token: jwt,
              token_type: 'JWT',
              expires_in: 3600,
            };
          }),
        ),
      ),
    );
  }
}
