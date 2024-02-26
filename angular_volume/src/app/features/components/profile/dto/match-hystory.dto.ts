enum MatchMode {
	CLASSIC,
	CYBERPUNK
  }

export interface MatchHistory {
	id: number      
	User1: string
	User2: string
	winner: string
	score:  string
	mode :  MatchMode
}

export interface MatchHistoryDatabase {
	id: number      
	User1Id: string
	User2Id: string
	winner: string
	score:  string
	mode :  MatchMode
	createdAt : string;
}
