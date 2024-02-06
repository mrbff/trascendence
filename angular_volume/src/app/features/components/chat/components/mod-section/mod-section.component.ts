import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-mod-section',
  templateUrl: './mod-section.component.html',
  styleUrls: ['./mod-section.component.css'],
})
export class ModSectionComponent implements OnInit, AfterViewInit {
  dialog: any;
  isOpen: boolean;

  constructor(
    private readonly userService: UserService,
    private readonly chatGateway: ChatGateway,
    private readonly httpClient: HttpClient,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private activatedRoute: ActivatedRoute) {
    this.isOpen = false;
  }

  async ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.dialog = document.querySelector('.modSection');
  }

  changeDialogStatus() {
    if (this.dialog.open) {
      this.isOpen = false;
      this.dialog.close();
    } else {
      this.isOpen = true;
      this.dialog.show();
    }
  }
}