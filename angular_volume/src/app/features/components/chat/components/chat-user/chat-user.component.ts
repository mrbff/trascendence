import { ChatComponent } from './../../chat.component';
import { UserService } from 'src/app/core/services/user.service';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
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
  @Input() conversation!: any;
  @Output() openChat = new EventEmitter<string>();
  user: any = null;

  @HostListener('click') onClick() {
    this.openChat.emit(this.conversation);
  }

  constructor(private readonly friendService: FriendsService,
    private readonly UserService: UserService,
    private readonly ChatGateway: ChatGateway) {}

  async ngOnInit() {
    if (!this.conversation.isGroup) {
    this.user = await this.friendService.getFriendInfo(
      this.conversation.name
    );
    }
  }

  leaveChannel(channelId: string) {
    console.log(channelId)
    this.ChatGateway.changeUserStatus(channelId, this.UserService.getUser(), 'KICKED');
    this.ChatGateway.sendModChannelMsg(`${this.UserService.getUser()} have LEAVE the channel`, channelId);
  }
}
