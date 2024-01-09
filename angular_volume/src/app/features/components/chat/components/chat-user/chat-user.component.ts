import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FriendsService } from 'src/app/core/services/friends.service';

@Component({
  selector: 'app-chat-user',
  templateUrl: './chat-user.component.html',
  styleUrls: ['./chat-user.component.css'],
})
export class ChatUserComponent implements OnInit {
  @Input() conversation: any;
  @Output() openChat = new EventEmitter<string>();
  user: any;

  @HostListener('click') onClick() {
    this.openChat.emit(this.user.name);
  }

  constructor(private readonly friendService: FriendsService) {}

  async ngOnInit() {
    this.user = await this.friendService.getFriendInfo(
      this.conversation.name
    );
  }
}
