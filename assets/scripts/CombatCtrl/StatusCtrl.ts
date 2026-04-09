import { _decorator, Component, director, Node, Vec3 } from 'cc';
import { ResMgr } from '../mgr/ResMgr';
import { CharactorType } from '../enum/GameEnum';
import { Global } from '../Global';
import { PoolMgr } from '../mgr/PoolMgr';
import { BloodBarCtrl } from '../ctrl/BloodBarCtrl';
const { ccclass, property } = _decorator;

@ccclass('StatusCtrl')
export class StatusCtrl extends Component {

    @property({ 
        // 显示顺序
        displayOrder: 0, 
        tooltip: '怪物序号,和json配置一样' 
    })
    id = 0;

    @property({ 
        type: CharactorType,
        // 显示顺序
        displayOrder: 1, 
        tooltip: '场景角色的类型' 
    })
    charactor = CharactorType.None;
    
    // 存储角色当前动态计算出来的各项数值，对象回收后，清除掉
    public currAttribue: Map<string, number> = new Map<string, number>();

    _atk = false;

    bloodBarNode: Node = null!;

    private initted = false;

    bloodbarpos = new Vec3

    isDie: boolean = true;

    /**是否有盾 */
    Shield = false

    hurt = false

    onDisable() {
        this.initted = false;
        if (this.bloodBarNode) {
            this.bloodBarNode.getComponent(BloodBarCtrl).recycleSelf();
        }
        this.currAttribue.clear()
        this.node.setRotationFromEuler(0, 0, 0);
        this.unschedule(this.regHP)
    }

    public async initStatus(): Promise<void> {
        this._atk = false;
        
        const config = ResMgr.ins.getJson("monster")[this.id];

        // 总生命
        this.currAttribue.set('hptotal', config.hp);
        // 当前生命
        this.currAttribue.set('hp', config.hp);
        // 
        this.currAttribue.set('def', config.def);
        // 攻击间隔
        this.currAttribue.set('dt', 1);
        // 攻击力
        this.currAttribue.set('atk', config.atk);
        // 暴击
        this.currAttribue.set('crit', config.crit);
        // 闪避
        this.currAttribue.set('miss', config.miss)

        // 是否是玩家
        if (this.charactor == CharactorType.Player) {
            Global.playerAtk.node = this.node;
            Global.playerAtk.dmg = config.atk;
            Global.playerAtk.crit = config.crit;
        }
    }

    /**
    * 初始化血条
    */
    public initBloodBar(show: boolean = true): void {
        this.bloodBarNode = PoolMgr.ins.getNode("BloodBar", Global.layer[3]);
        const hp = this.currAttribue.get('hptotal');
        this.bloodBarNode.getComponent(BloodBarCtrl)!.initBloodBar(hp, show);
        this.initted = true;
    }

    public regHP(): void {
        const reg = this.currAttribue.get("hpreg");
        if (reg <= 0) return;
        this.currAttribue.set('hp', this.currAttribue.get('hp') + reg);
        if (this.currAttribue.get('hp') > this.currAttribue.get('hptotal')) this.currAttribue.set('hp', this.currAttribue.get('hptotal'))
        this.updateBloodBar(reg, 1)
        if (this.charactor === CharactorType.Player) {
            director.emit("playerhp", this.currAttribue.get('hp'), this.currAttribue.get('hptotal'), true)
        }
    }

    lsHp(reg) {
        if (reg <= 0) return
        reg = Math.floor(reg)
        this.currAttribue.set('hp', this.currAttribue.get('hp') + reg)
        if (this.currAttribue.get('hp') > this.currAttribue.get('hptotal')) this.currAttribue.set('hp', this.currAttribue.get('hptotal'))
        this.updateBloodBar(reg, 1)
        if (this.charactor === CharactorType.Player) {
            director.emit("playerhp", this.currAttribue.get('hp'), this.currAttribue.get('hptotal'), true)
        }
    }

    updateBloodBar(dmg = 0, crit) {
        this.bloodBarNode.getComponent(BloodBarCtrl)!.onDmgBlood(this.currAttribue.get('hp'), dmg, crit)
    }

    lateUpdate(dt: number) {
        // if (Global.GamePause) return
        if (this.initted) {
            this.bloodbarpos.set(this.node.position);
            this.bloodbarpos.y += 2;
            Global.camera.convertToUINode(this.bloodbarpos, Global.layer[3], this.bloodbarpos);
            this.bloodBarNode.setPosition(this.bloodbarpos)
        }
    }

    closeShield() {
        this.Shield = false
    }

}


