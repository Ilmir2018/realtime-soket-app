import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { LoginResponseI } from 'src/app/models/login-response.interface';
import { UserI } from 'src/app/models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private snackbar: MatSnackBar) {}

  login(user: UserI): Observable<LoginResponseI> {
    return this.http.post<LoginResponseI>('back/users/login', user).pipe(
      tap((res: LoginResponseI) =>
        localStorage.setItem('access_token', res.access_token)
      ),
      tap(() =>
        this.snackbar.open('Login Successfull', 'Close', {
          duration: 2500,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        })
      ),
      catchError((e) => {
        this.snackbar.open(
          `Login was not successfull: ${e.error.message}`,
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          }
        );
        return throwError(e);
      })
    );
  }
}
