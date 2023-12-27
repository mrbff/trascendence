import * as BABYLON from "@babylonjs/core";


export class Power{
	texture!: string;
	effect (target: BABYLON.Mesh) {};
	end(target: BABYLON.Mesh) {};
}


export class Enlarge extends Power {
	override texture = "../../../../../assets/large.png";
	override effect(target: BABYLON.Mesh): void {
		target.scaling.y = 2;
		setTimeout(()=> {this.end(target)}, 20000);
	}
	override end(target: BABYLON.Mesh): void {
		target.scaling.y = 1;
	}
}

export class Speed extends Power {
	override texture = "../../../../../assets/speed.png";
	override effect(target: BABYLON.Mesh): void {
		target.metadata.speed = 2;
		setTimeout(()=> {this.end(target)}, 15000);
	}
	override end(target: BABYLON.Mesh): void {
		target.metadata.speed = 1;
	}
}

export class Shield extends Power {
	override texture = "../../../../../assets/shield.png";
	shield!: BABYLON.Mesh;
	override effect(target: BABYLON.Mesh) {
		this.shield = BABYLON.MeshBuilder.CreateCylinder('shield', {height: 7, diameter: 0.5})
		this.shield.position = target.position;
		this.shield.position.z += this.shield.position.z > 0 ? 1 : -1;
		this.shield.checkCollisions = true;
		this.shield.material = new BABYLON.StandardMaterial('shieldMat');
		(this.shield.material as BABYLON.StandardMaterial).diffuseTexture = ;
		setTimeout(()=> {this.end(target)}, 10000);
	}
	override end(target: BABYLON.Mesh): void {
		this.shield.dispose();
	}
}
