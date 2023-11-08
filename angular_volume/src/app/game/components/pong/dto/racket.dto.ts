//import { Power } from './power.dto';

export interface Racket{
	player:number;
	//position:number[][];
	//activePower:Power;
	width:number;
	height: number;
	margin: number;
	speed: number;
}

export const START_RACKET_DATA: Racket ={
	player:1,
	width: 3,
	height: 20,
	margin: 3,
	speed: 0
}