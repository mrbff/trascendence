import * as BABYLON from 'babylonjs';


export class Power{
	time!: number;
	texture!: string;
	effect (target: BABYLON.AbstractMesh) {};
}


export class Enlarge extends Power {
	override time = 15;
	override texture = "path/to/texture";
	override effect(target: BABYLON.Mesh): void {
		target.scaling.y = 2;
	}
}

export class Speed extends Power {
	override time = 15
	override texture = "";
	override effect(target: BABYLON.AbstractMesh): void {
		target.metadata.speed = 2;
	}
}
