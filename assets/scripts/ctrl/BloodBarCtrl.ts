import { _decorator, CCBoolean, Component, Font, Label, Node, Prefab, Sprite, SpriteComponent, UIOpacity } from 'cc';
import { PoolMgr } from '../mgr/PoolMgr';
import { DmgAnimCtrl } from './DmgAnimCtrl';
const { ccclass, property } = _decorator;

@ccclass('BloodBarCtrl')
export class BloodBarCtrl extends Component {

    // 血条文本
    @property(Node)
    nodeNick: Node = null!;

    // 红色进度
    @property(Sprite)
    hpProgress: Sprite = null!;

    // 黄色进度
    @property(Sprite)
    blankhp: Sprite = null!;

    // 深红色进度
    @property(Node)
    bloodbarBG: Node = null!;

    // 冒血文字根节点
    @property(Node)
    DmgPop: Node = null!

    // 冒血字体，5种
    @property(Font)
    DmgFont: Font[] = [];

    // 是否是玩家
    @property(CCBoolean)
    player: boolean = false;

    // 冒血文本动画预制体
    @property(Prefab)
    dmgpfb: Prefab = null!;

    // 进度
    private percent = 1;

    // 血量
    private hp: number = 0;

    // 是否已死
    private isDied = false;

    public initBloodBar(hp: number, show = true) {
        // 满血
        this.percent = this.hpProgress.fillRange = this.blankhp.fillRange = 1;
        this.hp = hp;
        this.nodeNick.getComponent(Label)!.string = `${hp}`;
        this.node.getComponent(UIOpacity).opacity = show ? 255 : 0;
        this.isDied = false;
    }

    // 回收
    public recycleSelf() {
        this.isDied = true;
        // 取消调度所有已调度的回调函数。
        this.unscheduleAllCallbacks();
        for (let i = this.DmgPop.children.length - 1; i >= 0; i--) {
            PoolMgr.ins.putNode(this.DmgPop.children[0]);
        }
        this.hpProgress.fillRange = 1
        this.blankhp.fillRange = 1
        PoolMgr.ins.putNode(this.node);
    }
    
    public onMiss() {
        let dmgpop = PoolMgr.ins.getNode(this.dmgpfb, this.DmgPop);
        dmgpop.getComponent(DmgAnimCtrl).init("miss", this.DmgFont[3]);
    }

    onBlankReduce() {
        if (this.isDied) return
        this.blankhp.fillRange = this.percent
        if (this.percent == 0) {
            this.isDied = true;
            this.unscheduleAllCallbacks();
        }
    }

    /**
     * 被攻击或者升级后，血条变化回调
     * @param percent 
     */
    onDmgBlood(hp: number, dmg: number, crit: boolean) {
        if (this.isDied) return;
        const type = crit ? 1 : 0;
        const dmgpop = PoolMgr.ins.getNode(this.dmgpfb, this.DmgPop);
        dmgpop.getComponent(DmgAnimCtrl).init(dmg, this.DmgFont[type])

        var percent = hp / this.hp;
        if (percent < 0) {
            percent = 0
        }
        this.hpProgress.fillRange = this.percent = percent;
        this.scheduleOnce(this.onBlankReduce, 0.15);
    }

}


