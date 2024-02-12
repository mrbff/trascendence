import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { UserService } from "src/app/core/services/user.service";
import { UserInfo } from "src/app/models/userInfo.model";
import { MatchHistory, MatchHistoryDatabase } from "../../dto/match-hystory.dto";

@Component({
	selector: 'app-match-history',
	templateUrl: './match-history.component.html',
	styleUrls: ['./match-history.component.css'],
})
export class MatchHistoryComponent implements OnInit{
	@Input() user!: UserInfo;
	matchHistory: MatchHistory[] = []; 

	constructor(private readonly userService: UserService)	{
	}

	ngOnInit(): void {
		this.loadMatchHistory();
	}

	private async loadMatchHistory() {
		let temp = await this.userService.getMatchHistory(this.user.id) as MatchHistoryDatabase[];
		temp.forEach(async (match, i) => {
			this.matchHistory[i] = {
				id: match.id,
				mode: match.mode,
				score: match.score,
				winner: match.winner,
				User1: '',
				User2: '',
			};
	
			if (match.User1Id == this.user.id) {
				this.matchHistory[i].User1 = this.user.username;
				this.matchHistory[i].User2 = (await this.userService.getOther(match.User2Id)).username;
			} else {
				this.matchHistory[i].User2 = this.user.username;
				console.log(match.User1Id)
				this.matchHistory[i].User1 = (await this.userService.getOther(match.User1Id)).username;
			}
		});
	}

 }
