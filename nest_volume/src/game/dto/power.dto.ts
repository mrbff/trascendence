import * as BABYLON from 'babylonjs';

export class Power{
	type!: string;
	effect (target: BABYLON.AbstractMesh) {};
	end(target: BABYLON.AbstractMesh) {};
}


export class Enlarge extends Power {
	override type = 'Enlarge';
	override effect(target: BABYLON.AbstractMesh): void {
		if (target) {
			if (target.scaling) {
				target.scaling.y = 1.5;
				setTimeout(()=> {this.end(target)}, 20000);
			}
		}
	}
	override end(target: BABYLON.AbstractMesh): void {
		if (target) {
			if (target.scaling)
				target.scaling.y = 1;
			}
		}
}

export class Speed extends Power {
	override type = 'Speed';
	override effect(target: BABYLON.AbstractMesh): void {
		if (target) {
			if (target.metadata) {
				target.metadata.speed = 2;
				setTimeout(()=> {this.end(target)}, 15000);
			}
		}
	}
	override end(target: BABYLON.AbstractMesh): void {
		if (target) {
			if (target.metadata) {
				target.metadata.speed = 1;
			}
		}
	}
}

export class Shield extends Power {
	override type = 'Shield';
	override effect(target: BABYLON.AbstractMesh) {
		if (target){
			if (target.metadata){
				target.metadata.shield.checkCollisions = true;
				setTimeout(()=> {this.end(target)}, 10000);
			}
		}
	}
	override end(target: BABYLON.AbstractMesh): void {
		if (target) {
			if (target.metadata) {
				target.metadata.shield.checkCollisions = false;
			}
		}
	}
}
