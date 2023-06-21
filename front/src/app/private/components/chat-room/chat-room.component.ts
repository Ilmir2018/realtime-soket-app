import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { MessagePaginateI } from 'src/app/models/message.interface';
import { RoomI } from 'src/app/models/room.interface';
import { ChatService } from '../../services/chat-service/chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.less'],
})
export class ChatRoomComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() chatRoom: RoomI;

  @ViewChild('message')
  private messagesScroller: ElementRef;

  messagesPaginate$: Observable<MessagePaginateI> = combineLatest([
    this.chatService.getMessages(),
    this.chatService.getAddedMessage().pipe(startWith(null)),
  ]).pipe(
    map(([messagePaginate, message]) => {
      if (
        message &&
        message.room.id === this.chatRoom.id &&
        !messagePaginate.items.some((m) => m.id === message.id)
      ) {
        messagePaginate.items.push(message);
      }
      const items = messagePaginate.items.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      messagePaginate.items = items;
      return messagePaginate;
    }),
    tap(() => this.scrollToBottom())
  );

  chatMessage: FormControl = new FormControl(null, [Validators.required]);

  constructor(private chatService: ChatService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.chatService.leaveRoom(changes['chatRoom'].previousValue);
    if (this.chatRoom) {
      this.chatService.joinRoom(this.chatRoom);
    }
  }

  ngAfterViewInit(): void {
    if (this.messagesScroller) {
      this.scrollToBottom();
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

  scrollToBottom() {
    try {
      setTimeout(() => {
        this.messagesScroller.nativeElement.scrollTop =
          this.messagesScroller.nativeElement.scrollHeight;
      }, 1);
    } catch {}
  }
}
