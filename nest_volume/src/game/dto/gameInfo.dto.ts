import { Scene } from "babylonjs";
import { Socket } from "socket.io";


export interface GameInfo{
	player1: Socket;
	player2: Socket;
	id1: number;
	id2: number;
	score1: number;
	score2: number;
	scene?: Scene;
	mode?: string;
	timer?: NodeJS.Timeout;
	inviteGame: string | null;
	winner: number;
	renderFunction?: any;
	playersReady: Set<string>;
}

// export const START_GAME_DATA: GameInfo = {
// 	player: ,
// 	opponent: ,
// 	score1: 0,
// 	score2: 0,
// }
