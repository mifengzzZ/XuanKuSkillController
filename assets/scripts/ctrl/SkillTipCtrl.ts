import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SkillTipCtrl')
export class SkillTipCtrl extends Component {
    
    @property(Label)
    lb: Label = null;

    start() {

    }

    update(deltaTime: number) {
        
    }
}


