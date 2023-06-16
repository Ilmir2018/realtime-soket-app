import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MessagePaginateI } from 'src/app/models/message.interface';
import { RoomI } from 'src/app/models/room.interface';
import { ChatService } from '../../services/chat-service/chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.less'],
})
export class ChatRoomComponent implements OnInit, OnChanges, OnDestroy {
  @Input() chatRoom: RoomI;

  messages$: Observable<MessagePaginateI> = this.chatService.getMessages();

  chatMessage: FormControl = new FormControl(null, [Validators.required]);

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chatRoom) {
      this.chatService.joinRoom(this.chatRoom);
    }
  }

  ngOnDestroy(): void {
    this.chatService.leaveRoom(this.chatRoom);
  }

  sendMessage() {
    this.chatService.sendMessage({
      text: this.chatMessage.value,
      room: this.chatRoom,
    });
    this.chatMessage.reset();
  }
}
