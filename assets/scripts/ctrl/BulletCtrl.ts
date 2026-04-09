import { _decorator, Collider, Component, ITriggerEvent, Node } from 'cc';
import { baseAtk, bonusAtk } from '../enum/GameEnum';
import { RoleCtrl } from '../CombatCtrl/RoleCtrl';
const { ccclass, property } = _decorator;

@ccclass('BulletCtrl')
export class BulletCtrl extends Component {

    @property(Collider)
    collider: Collider = null;

    private _atk: baseAtk;
    private _bonus: bonusAtk;
    
    public init(atk: baseAtk, bonus: bonusAtk): void {
        this._atk = atk;
        this._bonus = bonus;
        this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
    }

    protected onDisable(): void {
        this._atk = null;
        this._bonus = null;
        this.collider.off('onTriggerEnter', this.onTriggerEnter, this);
    }

    private onTriggerEnter(event: ITriggerEvent) {
        const role = event.otherCollider.getComponent(RoleCtrl);
        role && role.beHit(this._atk, this._bonus);
    }

}


