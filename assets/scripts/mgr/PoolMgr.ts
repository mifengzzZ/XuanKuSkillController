import { _decorator, Component, instantiate, IVec3Like, Node, NodePool, Prefab, Vec3 } from 'cc';
import { Global } from '../Global';
import { EffectCtrl } from '../ctrl/EffectCtrl';
const { ccclass, property } = _decorator;

const skyPos = new Vec3(5, 4);

@ccclass('PoolMgr')
export class PoolMgr extends Component {
    
    private _dictPool: any = {}
    private _dictPrefab: any = {}

    public static _ins: PoolMgr;
    public static get ins() {
        if (this._ins) {
            return this._ins;
        }

        this._ins = new PoolMgr();
        return this._ins;
    }

    public copyNode(copynode: Node, parent: Node | null): Node {
        let name = copynode.name;
        this._dictPrefab[name] = copynode;
        let node = null;
        if (this._dictPool.hasOwnProperty(name)) {
            // 已有对应的对象池
            let pool = this._dictPool[name];
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                node = instantiate(copynode);
            }
        } else {
            // 没有对应对象池，创建他！
            let pool = new NodePool();
            this._dictPool[name] = pool;

            node = instantiate(copynode);
        }
        if (parent) {
            node.parent = parent;
            node.active = true;
        }
        return node;
    }

    /**
     * 根据预设从对象池中获取对应节点
     */
    public getNode(prefab: Prefab | string, parent?: Node, pos?: IVec3Like): Node {
        let tempPre;
        let name;
        if (typeof prefab === 'string') {
            tempPre = this._dictPrefab[prefab];
            name = prefab;
            if (!tempPre) {
                console.log("Pool invalid prefab name = ", name);
                return null;
            }
        } else {
            tempPre = prefab;
            name = prefab.data.name;
        }

        let node = null;
        if (this._dictPool.hasOwnProperty(name)) {
            // 已有对应的对象池
            let pool = this._dictPool[name];
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                node = instantiate(tempPre);
            }
        } else {
            // 没有对应对象池，创建他！
            let pool = new NodePool();
            this._dictPool[name] = pool;

            node = instantiate(tempPre);
        }

        if (parent) {
            node.parent = parent;
            node.active = true;
            if (pos) node.position = pos;
        }

        return node;
    }

     /**
     * 将对应节点放回对象池中
     */
    public putNode(node: Node | null) {
        if (!node) {
            return;
        }
        let name = node.name;
        let pool = null;
        if (this._dictPool.hasOwnProperty(name)) {
            // 已有对应的对象池
            pool = this._dictPool[name];
        } else {
            // 没有对应对象池，创建他！
            pool = new NodePool();
            this._dictPool[name] = pool;
        }
        pool.put(node);
    }

    /**
     * 根据名称，清除对应对象池
     */
    public clearPool(name: string) {
        if (this._dictPool.hasOwnProperty(name)) {
            let pool = this._dictPool[name];
            pool.clear();
        }
    }

    public setPrefab(name: string, prefab: Prefab): void {
        this._dictPrefab[name] = prefab;
    }

    public getPrefab(name: string): Prefab {
        return this._dictPrefab[name];
    }

    public preloadSkill(prefab: Prefab | string) {
        this.playSkill(prefab, true, skyPos, 0.65);
    }

    /**
     * @name: 
     * @msg: 
     * @param {Prefab} prefab 预制体名
     * @param {true} play 是否播放
     * @param {Vec3} pos 位置
     * @param {*} time 回收时间，不回收不填
     * @return {*}
     */
    public playSkill(prefab: Prefab | string, play: boolean = true, pos?: IVec3Like, time?, eulerY?, parent?): Node {
        let node = this.getNode(prefab, parent ? parent : Global.stage[3], pos);
        if (play) {
            node.getComponent(EffectCtrl).play();
        }

        if (time) {
            this.scheduleOnce(() => {
                if (play) {
                    node.getComponent(EffectCtrl).stop()
                }
                this.putNode(node)
            }, time);
        }
        if (eulerY) {
            node.setRotationFromEuler(0, eulerY);
        }
        return node;
    }

}


