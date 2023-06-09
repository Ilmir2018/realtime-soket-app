import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { UserI } from 'src/app/models/user.interface';
import { UserService } from 'src/app/public/services/user-service/user.service';

@Component({
  selector: 'app-select-users',
  templateUrl: './select-users.component.html',
  styleUrls: ['./select-users.component.less'],
})
export class SelectUsersComponent implements OnInit {
  @Input() users: UserI[] = null;
  @Output() addUser: EventEmitter<UserI> = new EventEmitter<UserI>();
  @Output() removeUser: EventEmitter<UserI> = new EventEmitter<UserI>();

  searchUsername = new FormControl();

  filteredUsers: UserI[] = [];
  selectedUser: UserI = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.searchUsername.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((username) =>
          this.userService
            .findByUsername(username)
            .pipe(tap((users: UserI[]) => (this.filteredUsers = users)))
        )
      )
      .subscribe();
  }

  addUserToForm() {
    this.addUser.emit(this.selectedUser);
    this.filteredUsers = [];
    this.selectedUser = null;
    this.searchUsername.setValue(null);
  }

  removeUserFromForm(user: UserI) {
    this.removeUser.emit(user);
  }

  setSelectedUser(user: UserI) {
    this.selectedUser = user;
  }

  displayFn(user: UserI) {
    if (user) {
      return user.username;
    } else {
      return '';
    }
  }
}
