import { _decorator, CCBoolean, Component, Font, Label, Node, Prefab, Sprite, SpriteComponent, UIOpacity } from 'cc';
import { PoolMgr } from '../mgr/PoolMgr';
const { ccclass, property } = _decorator;

@ccclass('BloodBarCtrl')
export class BloodBarCtrl extends Component {

    @property(Node)
    nodeNick: Node = null!;

    @property(Sprite)
    hpProgress: Sprite = null!;

    @property(Sprite)
    blankhp: Sprite = null!;

    @property(Node)
    bloodbarBG: Node = null!;

    @property(Node)
    DmgPop: Node = null!
    @property(Font)
    DmgFont: Font[] = [];

    @property(CCBoolean)
    player: boolean = false;

    @property(Prefab)
    dmgpfb: Prefab = null!;

    private percent = 1;
    private hp: number = 0;
    private isDied = false;

    public initBloodBar(hp: number, show = true) {
        // this.DmgPop.setPosition(18,)
        // this.BloodbarBG.setPosition(18,)
        this.percent = this.hpProgress.fillRange = this.blankhp.fillRange = 1;
        this.hp = hp;
        this.nodeNick.getComponent(Label)!.string = `${hp}`;
        this.node.getComponent(UIOpacity).opacity = show ? 255 : 0;

        this.isDied = false;

        // this.schedule(()=>{
        //     this.onDmgBlood(50,10,true)
        // },0.2,100)
    }

    public recycleSelf() {
        this.isDied = true;
        this.unscheduleAllCallbacks();
        for (var i = this.DmgPop.children.length - 1; i >= 0; i--) {
            PoolMgr.ins.putNode(this.DmgPop.children[0])
        }
        this.hpProgress.fillRange = 1
        this.blankhp.fillRange = 1
        PoolMgr.ins.putNode(this.node);

    }
    
}


