import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { UserI } from 'src/app/models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient, private snackbar: MatSnackBar) {}

  findByUsername(username: string): Observable<UserI[]> {
    return this.http.get<UserI[]>(
      `back/users/find-by-username?username=${username}`
    );
  }

  getUsers() {
    return this.http.get('back/users');
  }

  createUser(user: UserI): Observable<UserI> {
    return this.http.post<UserI>('back/users', user).pipe(
      tap((createdUser: UserI) =>
        this.snackbar.open(
          `User ${createdUser.username} created successfully`,
          'Close',
          {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          }
        )
      ),
      catchError((e) => {
        this.snackbar.open(
          `User culd not be created, due to: ${e.error.message}`,
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
