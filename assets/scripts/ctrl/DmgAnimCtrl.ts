import { _decorator, Animation, Component, Font, Label, Node } from 'cc';
import { PoolMgr } from '../mgr/PoolMgr';
const { ccclass, property } = _decorator;

@ccclass('DmgAnimCtrl')
export class DmgAnimCtrl extends Component {

    @property(Animation)
    anim: Animation = null;

    @property(Label)
    text: Label = null;

    public init(dmg: number, font: Font): void {
        this.text.font = font;
        this.text.fontSize = 56 + 16 * Math.random()
        this.text.string = "" + dmg
        this.node.setPosition(-40 + 80 * Math.random(), 0)
        this.anim.play()
        this.scheduleOnce(this.recycleSelf, 0.9);
    }
    
    public recycleSelf(): void {
        this.anim.stop();
        this.text.node.setPosition(0, 20);
        this.text.string = null;
        PoolMgr.ins.putNode(this.node);
    }

}


