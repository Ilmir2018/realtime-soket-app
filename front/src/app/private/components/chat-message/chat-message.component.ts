import { Component, Input, OnInit } from '@angular/core';
import { MessageI } from 'src/app/models/message.interface';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.less'],
})
export class ChatMessageComponent implements OnInit {
  @Input() message: MessageI;

  constructor() {}

  ngOnInit(): void {}
}
