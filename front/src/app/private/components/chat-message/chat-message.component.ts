import { Component, Input } from '@angular/core';
import { MessageI } from 'src/app/models/message.interface';
import { UserI } from 'src/app/models/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.less'],
})
export class ChatMessageComponent {
  @Input() message: MessageI;
  user: UserI = this.authService.getLoggedInUser();

  constructor(private authService: AuthService) {}
}
