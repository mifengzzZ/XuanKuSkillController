import { _decorator, Component, Node, Sprite } from 'cc';
import { Global } from '../Global';
const { ccclass, property } = _decorator;

@ccclass('LoadCtrl')
export class LoadCtrl extends Component {

    @property(Sprite)
    load: Sprite = null;

    private isLoad: boolean = true;

    public closeLoad(): void {
        this.isLoad = false;
        this.node.destroy();
    }

    protected update(dt: number): void {
        if (!this.isLoad) {
            return;
        }
        this.load.fillRange = Global.LoadingRate;
        if (Global.LoadingRate > 0.99) {
            this.closeLoad();
        }
    }
}


