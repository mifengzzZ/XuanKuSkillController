import { _decorator, Animation, Component, Node, ParticleSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EffectCtrl')
export class EffectCtrl extends Component {
    
    @property([ParticleSystem])
    eff: ParticleSystem[] = [];

    @property(Animation)
    anim: Animation = null;

    public stop(): void {
        if (this.eff) {
            for (let index = 0; index < this.eff.length; index++) {
                this.eff[index].stop();
                this.eff[index].clear();
            }
        }
        if (this.anim) {
            this.anim.stop();
        }
    }

    public play(): void {
        if (this.eff) {
            for (let index = 0; index < this.eff.length; index++) {
                this.eff[index].play();
            }
        }
        if (this.anim) {
            this.anim.play();
        }
    }

    public clear(): void {
        if (this.eff) {
            for (let index = 0; index < this.eff.length; index++) {
                this.eff[index].clear();
            }
        }
    }

}


