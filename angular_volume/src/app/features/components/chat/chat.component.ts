import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  private $subs = new Subscription();
  public messages: any[] = []; // You might want to create a Message interface or class
  public newMessage: string = '';
  public errorMsg: string = '';
  public channels!: string[]; // Populate with actual channels
  public users!: string[]; // Populate with actual user list

  showMsg: boolean;
  chat: any[];

  constructor(
    readonly userService: UserService,
    private readonly chatGateway: ChatGateway,
    private readonly route: ActivatedRoute
  ) {
    this.messages = [
      /*   {
        username: 'Franco',
        chat: [
          { msg: 'ciao', user: 'mbozzi' },
          { msg: 'ciao', user: 'mbozzi' },
          {
            msg: 'dsfnelfjweiofjewiofjewfgeroijgrpgjer;oqgn ro[iegn b[ioqegjr  wmtirtj  ]w m0ir DNWUIFHWEIFHWEIOFHEWFHBEWIFBEB WQKL;DM,AS/.C QW;OFJWQOPDN WKLDNC ONFIEONFOPEWJF',
            user: 'Franco',
          },
          { msg: 'ciao', user: 'mbozzi' },
          { msg: 'ciao', user: 'mbozzi' },
          { msg: 'dsfnelfjweiofjewiofjewf', user: 'Franco' },
          { msg: 'dsfnelfjweiofjewiofjewf', user: 'Franco' },
          {
            msg: 'dsfnelfjweiofjewiofjewfgeroijgrpgjer;oqgn ro[iegn b[ioqegjr  wmtirtj  ]w m0ir DNWUIFHWEIFHWEIOFHEWFHBEWIFBEB WQKL;DM,AS/.C QW;OFJWQOPDN WKLDNC ONFIEONFOPEWJF',
            user: 'mbozzi',
          },
          { msg: 'ciao', user: 'mbozzi' },
          { msg: 'dsfnelfjweiofjewiofjewf', user: 'Franco' },
          { msg: 'ciao', user: 'mbozzi' },
          { msg: 'ciao', user: 'mbozzi' },
          { msg: 'dsfnelfjweiofjewiofjewf', user: 'Franco' },
          { msg: 'dsfnelfjweiofjewiofjewf', user: 'Franco' },
        ],
      },
      {
        username: 'mbozzi',
        chat: [
          { msg: 'ciao', user: 'mbozzi' },
          { msg: 'ciao', user: 'mbozzi' },
          {
            msg: 'dsfnelfjweiofjewiofjewfgeroijgrpgjer;oqgn ro[iegn b[ioqegjr  wmtirtj  ]w m0ir DNWUIFHWEIFHWEIOFHEWFHBEWIFBEB WQKL;DM,AS/.C QW;OFJWQOPDN WKLDNC ONFIEONFOPEWJF',
            user: 'Franco',
          },
          { msg: 'ciao', user: 'mbozzi' },
          { msg: 'ciao', user: 'mbozzi' },
          { msg: 'dsfnelfjweiofjewiofjewf', user: 'Franco' },
          { msg: 'dsfnelfjweiofjewiofjewf', user: 'Franco' },
          {
            msg: 'dsfnelfjweiofjewiofjewfgeroijgrpgjer;oqgn ro[iegn b[ioqegjr  wmtirtj  ]w m0ir DNWUIFHWEIFHWEIOFHEWFHBEWIFBEB WQKL;DM,AS/.C QW;OFJWQOPDN WKLDNC ONFIEONFOPEWJF',
            user: 'mbozzi',
          },
          { msg: 'ciao', user: 'mbozzi' },
          { msg: 'dsfnelfjweiofjewiofjewf', user: 'Franco' },
          { msg: 'ciao', user: 'mbozzi' },
          { msg: 'ciao', user: 'mbozzi' },
          { msg: 'dsfnelfjweiofjewiofjewf', user: 'Franco' },
          { msg: 'dsfnelfjweiofjewiofjewf', user: 'Franco' },
        ],
      }, */
    ];
    this.showMsg = false;
    this.chat = [];
  }

  ngOnInit(): void {
    this.initializeChat();
  }

  initializeChat(): void {
    // OPEN USER CHAT IF USERNAME IN QUERY PARAMS
    this.$subs.add(
      this.route.queryParams.subscribe((params) => {
        const username = params['username'];
        if (username !== undefined) {
          this.openChat(username);
        }
      })
    );

    this.$subs.add(
      this.chatGateway.onMsgFromChannel().subscribe({
        next: (message) => {
          this.messages.push(message);
          console.log(message); ///debug
          console.log(this.messages);
        },
        error: (error) => {
          this.errorMsg = `Error receiving message from channel: ${error.message}`;
        },
      })
    );

    this.$subs.add(
      this.chatGateway.onMsgFromPriv().subscribe({
        next: (message) => {
          this.messages.push(message);
          console.log(message); ///debug
        },
        error: (error) => {
          this.errorMsg = `Error receiving message from user: ${error.message}`;
        },
      })
    );

    // To DO: $subscribe user joining, leaving, etc.
  }

  sendMessageToChannel(channel: string): void {
    if (this.newMessage.trim()) {
      this.chatGateway.sendChannelMsg(this.newMessage, channel);
      this.newMessage = ''; // Reset the input after sending
    }
  }

  sendMessageToUser(receiver: string): void {
    if (this.newMessage.trim()) {
      this.chatGateway.sendPrivMsg(this.newMessage, receiver);
      this.newMessage = ''; // Reset the input after sending
    }
  }

  ngOnDestroy(): void {
    this.$subs.unsubscribe();
  }

  // TO DO: handling user joining, leaving, etc.

  openChat(username: string) {
    this.chat = this.messages
      .filter((obj) => obj.username === username)
      .map((obj) => obj.chat)
      .flat();
  }
}
