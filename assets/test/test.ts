import { _decorator, Button, Component, Node } from 'cc';
import { EffectCtrl } from '../scripts/ctrl/EffectCtrl';
const { ccclass, property } = _decorator;

@ccclass('test')
export class test extends Component {

    @property(Button)
    startBtn: Button = null;

    @property(EffectCtrl)
    effCtrl: EffectCtrl = null;

    start() {
        this.startBtn.node.on(Button.EventType.CLICK, () => {
            this.effCtrl.play();
        });
    }

    update(deltaTime: number) {
        
    }
}


