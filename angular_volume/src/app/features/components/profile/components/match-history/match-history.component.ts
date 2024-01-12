import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { UserService } from "src/app/core/services/user.service";
import { UserInfo } from "src/app/models/userInfo.model";

@Component({
	selector: 'app-match-history',
	templateUrl: './match-history.component.html',
	styleUrls: ['./match-history.component.css'],
})
export class MatchHistoryComponent implements OnInit{
	@Input() user!: UserInfo;
	matchHistory!: any[]; 

	constructor(private readonly userService: UserService)	{
	}

	ngOnInit(): void {
		console.log(this.user)
		this.loadMatchHistory();
	}

	private async loadMatchHistory() {
		this.matchHistory = await this.userService.getMatchHistory(this.user.id);
		console.log(this.matchHistory);
	}

 }
