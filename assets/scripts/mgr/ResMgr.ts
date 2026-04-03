import { _decorator, AssetManager, assetManager, AudioClip, Component, instantiate, Material, Node, Prefab, SpriteAtlas } from 'cc';
import { Global } from '../Global';
import { Assets, AssetType } from '../enum/GameEnum';
import { PoolMgr } from './PoolMgr';
const { ccclass, property } = _decorator;

@ccclass('ResMgr')
export class ResMgr extends Component {

    private _abBundleMap: { [key: string]: AssetManager.Bundle } = {};
    private _clipMap: { [key: string]: AudioClip } = {};
    private _matMap: { [key: string]: Material } = {};
    private _atlasMap: { [key: string]: SpriteAtlas } = {};
    public _jsonAssetMap: { [key: string]: any } = {};

    public _loadStemp = null;
    private loadTime = 0;
    _totalTime = 0

    private static _ins: ResMgr = null;
    public static get ins() {
        if (!this._ins) {
            this._ins = new ResMgr();
        }

        return this._ins;
    }

    /**
     * 打印加载时间
     * @param name 
     * @param end 
     */
    public printTimer(name: string = "", end = false) {
        // 距离上次保存的时间相差多少
        this.loadTime = Date.now() - this._loadStemp;
        // 保存当前时间
        this._loadStemp = Date.now();
        // 累计加载时长
        this._totalTime += this.loadTime
        // 本次加载时长
        Global.Debug && console.log(name + ", load time===", this.loadTime, "ms")
        // 加载是否结束
        if (end) {
            // 打印总时长
            console.log("Load finish, total time===", this._totalTime, "ms")
        }
    }

    public async loadBundle(index: number, ratio: number = 0): Promise<void> {
        if (!this._loadStemp) this._loadStemp = Date.now();
        const rate = Global.LoadingRate;
        // Bundle文件夹的名字
        const name = "Bundle" + index
        return new Promise<void>((resolve, reject) => {
            assetManager.loadBundle(name, (err: any, bundle: AssetManager.Bundle) => {
                if (err) {
                    console.error("Bundle" + index + " load error, error==", err)
                } else {
                    // 保存bundle
                    if (index != 2) this._abBundleMap[index] = bundle;
                    // 打印加载一个bundle所消耗的时间
                    this.printTimer("Bundle" + index + "__" + "load success");
                    // 控制界面上的加载进度条
                    Global.LoadingRate = rate + ratio;
                    resolve && resolve();
                }
            })
        })
    }

    public async loadRes(index: number, type: AssetType, ratio: number = 0): Promise<void> {
        const rate = Global.LoadingRate;
        return new Promise<void>((resolve, reject) => {
            // 加载目标文件夹下的所有资源
            this._abBundleMap[index].loadDir(type.path, type.type, (finished: number, total: number) => {
                // this._loadTools.setValue(idx, finished / total);
                // 更新进度条 
                if (ratio > 0) Global.LoadingRate = rate + ratio * finished / total
            }, (err: any, assets: any[]) => {
                if (err) {
                    console.error("Error===", err);
                    resolve && resolve();
                }

                switch (type) {
                    case Assets.Prefabs:
                        for (let i = 0; i < assets.length; i++) {
                            const asset = assets[i] as Prefab;
                            const name = asset.data.name as string;
                            PoolMgr.ins.setPrefab(name, asset);
                            Global.Debug && console.log("prefab name==", name);
                        }
                        break
                    case Assets.Skills:
                        for (let i = 0; i < assets.length; i++) {
                            const asset = assets[i] as Prefab;
                            const name = asset.data.name as string;
                            PoolMgr.ins.setPrefab(name, asset);
                            PoolMgr.ins.preloadSkill(asset);
                            Global.Debug && console.log("prefab name==", name);
                        }
                        break;
                    case Assets.Clips:
                        for (let i = 0; i < assets.length; i++) {
                            const asset = assets[i];
                            Global.Debug && console.log("clip name==", asset.name);
                            if (!this._clipMap[asset.name]) this._clipMap[asset.name] = asset;
                        }
                        break;
                    case Assets.Material:
                        for (let i = 0; i < assets.length; i++) {
                            const asset = assets[i];
                            Global.Debug && console.log("mat name==", asset.name);
                            if (!this._matMap[asset.name]) this._matMap[asset.name] = asset;
                        }
                        break;
                    case Assets.Atlas:
                        for (let i = 0; i < assets.length; i++) {
                            const asset = assets[i];
                            Global.Debug && console.log("atlas name==", asset.name);
                            if (!this._atlasMap[asset.name]) this._atlasMap[asset.name] = asset;
                        }
                        break;
                    case Assets.Json:
                        for (let i = 0; i < assets.length; i++) {
                            const asset = assets[i];
                            Global.Debug && console.log("json name==", asset.name);
                            if (!this._jsonAssetMap[asset.name]) this._jsonAssetMap[asset.name] = asset.json;
                        }
                        break;
                }

                this.printTimer("Bundle" + index + "__" + type.path + "loaded success");
                resolve && resolve();
            })
        })
    }

    public async loadBgm(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._abBundleMap[5].load("bgm", function (err, bgm: AudioClip) {
                if (err) {
                    console.error("Error info===", err);
                    resolve && resolve();
                }
                if (!this._clipMap[bgm.name]) this._clipMap[bgm.name] = bgm
                resolve && resolve();
            });
        });
    }

    public async loadPrefab(info): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._abBundleMap[info.bundle].load(info.path + info.name, function (err, Prefab: Prefab) {
                if (err) {
                    console.error("Error info===", err);
                    resolve && resolve();
                }
                PoolMgr.ins.setPrefab(info.name, Prefab);
                resolve && resolve();
            });
        });
    }

    public async preloadRes(name: string, count: number, ratio: number = 0): Promise<void> {
        const rate = Global.LoadingRate;
        return new Promise<void>((resolve, reject) => {
            let pre = PoolMgr.ins.getPrefab(name);
            for (let i = 0; i < count; i++) {
                PoolMgr.ins.putNode(instantiate(pre));
            }
            if (ratio > 0) Global.LoadingRate = rate + ratio;
            this.printTimer("preload_" + name)
            resolve && resolve();
        });
    }

    public getAtlas(name: string): SpriteAtlas {
        return this._atlasMap[name];
    }

    public async getPrefab(prefabPath: any, parent?: Node) {
        if (PoolMgr.ins.getPrefab(prefabPath.name)) {
            return PoolMgr.ins.getNode(prefabPath.name, parent)
        }
        await this.loadPrefab(prefabPath)
        return PoolMgr.ins.getNode(prefabPath.name, parent)
    }

    public getJson(name: string): any {
        return this._jsonAssetMap[name];
    }

    public getClip(name: string) {
        return this._clipMap[name];
    }

    public getMat(name: string) {
        return this._matMap[name];
    }

    public async getUI(Path, Parent?: Node) {
        if (Path.clear) {
            if (!Parent && Global.layer[Path.layer].children[0]) {
                if (Global.layer[Path.layer].children[0].name == Path.name) return
                PoolMgr.ins.putNode(Global.layer[Path.layer].children[0])
            }
        }
        let ParentNode = Parent ? Parent : Global.layer[Path.layer]
        return await this.getPrefab(Path, ParentNode)
    }
    
}


