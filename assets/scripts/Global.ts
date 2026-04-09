import { _decorator, Camera, Component, Node } from 'cc';
import { baseAtk } from './enum/GameEnum';
const { ccclass, property } = _decorator;

@ccclass('Global')
export class Global extends Component {
    
    public static timeScale = 1;
    public static LoadingRate = 0;

    public static Debug = false;

    /**0环境节点,1是角色，2是怪物，3是子弹,4是回收 */
    public static stage: Node[] = [];

    public static layer: Node[] = [];

    public static camera: Camera = null;

    public static playerAtk: baseAtk = { dmg: 50, crit: 0.1 };

    static isFreeze = false
    static freezescale = 0
    public static freeze(scale: number, time: number) {
        if (this.isFreeze) return
        this.isFreeze = true
        this.freezescale = scale
        Global.timeScale = scale
        setTimeout(() => {
            this.isFreeze = false
            Global.timeScale = 1
        }, time * 1000);
    }

}


