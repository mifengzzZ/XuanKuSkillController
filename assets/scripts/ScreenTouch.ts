import { _decorator, animation, Animation, Component, EventTouch, Input, input, Node, Prefab, Vec2 } from 'cc';
import { PoolMgr } from './mgr/PoolMgr';
const { ccclass, property } = _decorator;

@ccclass('ScreenTouch')
export class ScreenTouch extends Component {
    
    effectPos: Vec2 = new Vec2(); 

    @property(Prefab)
    effect: Prefab = null;

    protected onEnable(): void {
        this._registerEvent();
    }

    protected _registerEvent(): void {
        input.on(Input.EventType.TOUCH_START, this._onTouchBegan, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onTouchSwallow, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchSwallow, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchSwallow, this);
    }

    protected _unregisterEvent() {
        input.off(Input.EventType.TOUCH_START, this._onTouchBegan, this);
        input.off(Input.EventType.TOUCH_CANCEL, this._onTouchSwallow, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onTouchSwallow, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchSwallow, this);
    }

    protected _onTouchSwallow(event: EventTouch) {
        if (!event) {
            return;
        }
    }

    protected _onTouchBegan(event: EventTouch) {
        if (!event) {
            return;
        }
        // 转换点击事件到屏幕UI坐标
        this.effectPos = event.getUILocation();
        const effect: Node = PoolMgr.ins.getNode(this.effect, this.node);
        effect.setWorldPosition(this.effectPos.x, this.effectPos.y, 0);
        let anim: Animation = effect.getComponent(Animation);
        anim.play();
        this.scheduleOnce(() => {
            effect.getComponent(Animation).stop();
            PoolMgr.ins.putNode(effect);
        }, 0.7);
    }

}