import * as BABYLON from 'babylonjs';

export class Power{
	type!: string;
	effect (target: BABYLON.AbstractMesh) {};
	end(target: BABYLON.AbstractMesh) {};
}


export class Enlarge extends Power {
	override type = 'Enlarge';
	override effect(target: BABYLON.AbstractMesh): void {
		target.scaling.y = 1.5;
		setTimeout(()=> {this.end(target)}, 20000);
	}
	override end(target: BABYLON.AbstractMesh): void {
		if (target)
			target.scaling.y = 1;
	}
}

export class Speed extends Power {
	override type = 'Speed';
	override effect(target: BABYLON.AbstractMesh): void {
		target.metadata.speed = 2;
		setTimeout(()=> {this.end(target)}, 15000);
	}
	override end(target: BABYLON.AbstractMesh): void {
		if (target)
			target.metadata.speed = 1;
	}
}

export class Shield extends Power {
	override type = 'Shield';
	override effect(target: BABYLON.AbstractMesh) {
		target.metadata.shield.checkCollisions = true;
		setTimeout(()=> {this.end(target)}, 10000);
	}
	override end(target: BABYLON.AbstractMesh): void {
		if (target)
			target.metadata.shield.checkCollisions = false;
	}
}
