import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
})
export class LoginComponent {
  form: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });

  constructor(private authSertvice: AuthService, private router: Router) {}

  get email(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.form.get('password') as FormControl;
  }

  login() {
    if (this.form.valid) {
      this.authSertvice
        .login({ email: this.email.value, password: this.password.value })
        .pipe(
          tap(() => {
            this.router.navigate(['../../private/dashboard']);
          })
        )
        .subscribe();
    }
  }
}
