import * as BABYLON from "@babylonjs/core";


export class Power{
	texture!: string;
	type!: string;
	effect (target: BABYLON.AbstractMesh) {};
	end(target: BABYLON.AbstractMesh) {};
}


export class Enlarge extends Power {
	override texture = "../../../../../assets/large.png";
	override type = 'Enlarge';
	override effect(target: BABYLON.AbstractMesh): void {
		target.scaling.y = 1.5;
		setTimeout(()=> {this.end(target)}, 20000);
	}
	override end(target: BABYLON.AbstractMesh): void {
		target.scaling.y = 1;
	}
}

export class Speed extends Power {
	override texture = "../../../../../assets/speed.png";
	override type = 'Speed';
	override effect(target: BABYLON.AbstractMesh): void {
		target.metadata.speed = 2;
		setTimeout(()=> {this.end(target)}, 15000);
	}
	override end(target: BABYLON.AbstractMesh): void {
		target.metadata.speed = 1;
	}
}

export class Shield extends Power {
	override texture = "../../../../../assets/shield.png";
	override type = 'Shield';
	override effect(target: BABYLON.AbstractMesh) {
		target.metadata.shield.visibility = 1;
		setTimeout(()=> {this.end(target)}, 10000);
	}
	override end(target: BABYLON.AbstractMesh): void {
		target.metadata.shield.visibility = 0;
	}
}
