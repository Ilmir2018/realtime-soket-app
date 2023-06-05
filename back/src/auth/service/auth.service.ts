import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { from, Observable } from 'rxjs';
import * as bcryptjs from 'bcryptjs';
import { UserI } from 'src/user/model/user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJwt(user: UserI): Observable<string> {
    return from(this.jwtService.signAsync({ user }));
  }

  hashPassword(password: string): Observable<string> {
    return from<string>(bcryptjs.hash(password, 12));
  }

  comparePassword(
    passsword: string,
    stroredPasswordHash: string,
  ): Observable<any> {
    return from(bcryptjs.compare(passsword, stroredPasswordHash));
  }

  async verifyJwt(jwt: string): Promise<any> {
    return await this.jwtService.verifyAsync(jwt);
  }
}
