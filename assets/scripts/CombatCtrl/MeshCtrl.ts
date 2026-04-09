import { _decorator, Component, MeshRenderer, Node } from 'cc';
const { ccclass, property } = _decorator;

const hurtColor: [number, number, number, number][] = [
    [0, 0, 0, 0],
    [1, 1, 0, 0.7],
    [1, 1, 0, 0.7],
    [0.25, 0.1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],

]

@ccclass('MeshCtrl')
export class MeshCtrl {
    
    private _range = 0;
    private mesh: MeshRenderer;

    constructor(mesh: MeshRenderer) {
        this.mesh = mesh;
    }

    get disRange() {
        return this._range;
    }

    set disRange(v: number) {
        this._range = v;
        this.mesh.setInstancedAttribute('a_disRange', [v]);
    }


    set colorType(type: number) {
        this.mesh.setInstancedAttribute('a_rimColor', hurtColor[type]);
    }

}


