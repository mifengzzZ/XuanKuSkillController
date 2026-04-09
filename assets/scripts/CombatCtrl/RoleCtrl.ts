import { _decorator, Animation, Component, director, MeshRenderer, Node, tween } from 'cc';
import { MeshCtrl } from './MeshCtrl';
import { StatusCtrl } from './StatusCtrl';
import { baseAtk, bonusAtk, CharactorType, Clip, EventType, skillConfig } from '../enum/GameEnum';
import { BloodBarCtrl } from '../ctrl/BloodBarCtrl';
import { PoolMgr } from '../mgr/PoolMgr';
import { AudioMgr } from '../mgr/AudioMgr';
import { Global } from '../Global';
const { ccclass, property } = _decorator;

const idle = "idle";
const hit = "hit";
const die = "die";
const attack = "attack";

@ccclass('RoleCtrl')
export class RoleCtrl extends StatusCtrl {

    @property(Animation)
    anim: Animation = null;

    @property({ 
        type: MeshRenderer, 
        tooltip: '角色mesh材质' 
    })
    mesh: MeshRenderer = null!

    private meshCtrl: MeshCtrl = null;

     private isHurt = false;

    private isInit = false

    /**新动画之前的动画 */
    private animType: string = null;

    private boomTime: number = 0;

    protected onEnable(): void {
        this.anim.node.setPosition(0, -180);
    }

    init() {
        if (!this.isInit) {
            this.initStatus()
            this.meshCtrl = new MeshCtrl(this.mesh);
            this.isInit = true;
        } else {
            this.initStatus()
        }

        if (this.charactor == CharactorType.Player) {
            director.on(EventType.PlayAnm, this.playAnim, this);
        }

        this.anim.play(idle);

        tween(this.meshCtrl).set({ disRange: -1 }).call(() => {
            this.anim.node.setPosition(0, 0);
        }).to(1., { disRange: 0 }).call(() => {
            this.isDie = false;
            this.initBloodBar(true);
        }).start();
    }

    /**
    * 收到伤害
    * @param crit
    * @param atk 
    * @param debuff
    */
    beHit(baseAtk: baseAtk, bonusAtk: bonusAtk | skillConfig) {
        if (this.isDie) return;
        if (this.Shield) {
            this.bloodBarNode.getComponent(BloodBarCtrl).onMiss()
            return;
        }
        if (this.currAttribue.get('shield') > Math.random()) {
            this.unschedule(this.closeShield)
            this.Shield = true
            this.schedule(
                this.closeShield
                , 2, 0)
            this.bloodBarNode.getComponent(BloodBarCtrl)!.onMiss()
            return;
        }
        const atk = baseAtk.dmg * bonusAtk.scale;
        const crit = baseAtk.crit;
        this.onHurt(atk, crit);
        if (bonusAtk.repeat) {
            this.schedule(() => {
                this.onHurt(atk, crit)
            }, 0.22, bonusAtk.repeat - 1)
        }

        //飞剑
        if (bonusAtk.sword && bonusAtk.sword > Math.random()) {
            PoolMgr.ins.playSkill("Sword", true, this.node.position, 0.5)
            AudioMgr.ins.play(Clip.sword)
            this.schedule(() => {
                this.onHurt(atk * 0.25, 0, 1)
            }, 0.25, 3, 0.2)
        }
        //剧毒buff
        if (bonusAtk.veno && bonusAtk.veno > Math.random()) {
            this.onHurt(atk, 0)
            this.schedule(() => {
                this.onHurt(atk, 0, 2)
            }, 0.6, 1)
        }
        //剑刃buff
        if (bonusAtk.wave && bonusAtk.wave > Math.random()) {
            AudioMgr.ins.play(Clip.wave)
            const wave: Node = PoolMgr.ins.playSkill("bladewave", true, baseAtk.node.position, 0.75)
            wave.setRotationFromEuler(0, baseAtk.node.eulerAngles.y)
            this.schedule(() => {
                this.onHurt(atk * 0.65, 0, 3)
            }, 0.1, 0)
        }
        //火焰buff
        if (bonusAtk.fire && bonusAtk.fire > Math.random()) {
            this.schedule(() => {
                this.onHurt(atk * 0.7, 0, 4)
            }, 0.55, 0)
        }

        //闪电buff
        if (bonusAtk.thunder && bonusAtk.thunder > Math.random()) {
            PoolMgr.ins.playSkill("lighteffect", true, this.node.position, 0.65)
            this.schedule(() => {
                this.onHurt(atk * 0.4, 5)
            }, 0.26, 0, 0.2)
        }

    }

    stopHit() {
        this.hurt = false;
    }

    /**
    * 伤害计算公式
    * @param atk 基础伤害
    */
    reallyDmg(atk: number) {
        //真实伤害
        atk = atk * (1 - 0.1) * (1 + 0.05 * Math.random()) + 8 * Math.random()
        return Math.floor(atk);
    }

    onHurt(dmg: number, crit: number, type = 0) {

        if (this.isDie) {
            return
        }
        const _miss: boolean = Math.random() <= this.currAttribue.get('miss')

        if (_miss) {
            this.bloodBarNode.getComponent(BloodBarCtrl).onMiss()
            return;
        }

        this.bitAnim(type);

        const _crit = crit > Math.random() ? true : false
        if (_crit) {
            dmg *= 2;
            director.emit(EventType.ScreenShake, 0.3);
            Global.freeze(0.1, 0.02);

        }

        dmg = this.reallyDmg(dmg)



        const hp = this.currAttribue.get('hp') - dmg;
        if (hp <= 0) {
            this.currAttribue.set('hp', 0)
            this.death()
        } else {
            this.currAttribue.set('hp', hp)
        }
        this.updateBloodBar(dmg, _crit)
    }

    /**
     * 死亡
     */
    async death() {
        if (this.isDie) return
        this.isDie = true;

        this.hurt = false;
        /** 避免一起播放死亡声音*/
        this.unscheduleAllCallbacks();
        this.returnNormal();

        this.bloodBarNode && this.bloodBarNode.getComponent(BloodBarCtrl).recycleSelf();

        this.scheduleOnce(() => {
            this.playAnim(die);
            AudioMgr.ins.play(Clip.die);
            director.emit(EventType.ScreenShake, 0.5)
            Global.freeze(0.3, 0.15);


        }, Math.random() * 0.25)

        this.node.parent = Global.stage[4]

        // this.playAnim(this.deathAnim);

        tween(this.meshCtrl).to(1.5, { disRange: -1 }).call(() => {
            this.recycleSelf();
        }).start();


    }

    /**怪或者任务 死亡后，系统回收到对象池 */
    recycleSelf() {
        if (!this.isDie) return;
        this.anim.stop()

        if (Global.Debug) {
            this.anim.node.setPosition(0, -180);
            const t = Math.random() * 0.5 + 1;
            this.scheduleOnce(() => {
                this.init();
            }, t)
        } else {

            PoolMgr.ins.putNode(this.node)

        }


    }

    playNormalAnim(animType) {

        this.anim.play(animType)
        this.animType = animType

    }

    /**
     * 播放被攻击变色
     */
    bitAnim(type: number = 0) {
        if (!this.isHurt) {
            AudioMgr.ins.play(Clip.hurt)
            PoolMgr.ins.playSkill("Boom", true, this.node.position, 0.25);
            this.playAnim(hit);
            this.meshCtrl.colorType = type + 1;
            this.unschedule(this.returnNormal)
            this.scheduleOnce(this.returnNormal, 0.2)
            this.isHurt = true;
        }

    }

    returnNormal() {
        this.playAnim(idle);

        this.isHurt = false;
        this.meshCtrl.colorType = 0;
    }

    /**
     * 播放指定的角色动作
     * @param animType 
     * @param isLoop 
     */
    public playAnim(animType): void {
        if (this.animType == animType && this.animType != hit && this.animType != attack) {
            return;
        } else {
            this.anim.play(animType);
            this.animType = animType;
        }
    }

}


