import { _decorator, Camera, Canvas, CCBoolean, Component, director, game, instantiate, Node, SceneGlobals } from 'cc';
import { Global } from './Global';
import { ResMgr } from './mgr/ResMgr';
import { Assets } from './enum/GameEnum';
import { Util } from './utils/Util';
import { PoolMgr } from './mgr/PoolMgr';
const { ccclass, property } = _decorator;

const skip = 1;

const postions = [
    { x: 0, y: 1.5, z: 2.5 },
    { x: 1.6, y: 1.5, z: -1 },
    { x: -1.6, y: 1.5, z: -1 },
    { x: 0, y: 1.5, z: -2.6 },
    { x: 0, y: 1.5, z: 0.4 },
];

@ccclass('Main')
export class Main extends Component {

    @property(Camera)
    camera: Camera = null;

    @property(CCBoolean)
    debug: boolean = true;

    @property(Node)
    skillBtns: Node = null;

    private layer: Node[] = [];
    private stage: Node[] = [];

    private skyBox: SceneGlobals["skybox"] = null;

    private _dt: number = 0;

    protected onLoad(): void {
        this.overwriteDirector();
    }

    protected async start() {
        this.skyBox = director.getScene().globals.skybox;

        if (this.debug) {
            Global.Debug = true;
        } else {
            console.log = (() => {
            });
            console.debug = (() => {
            });
            console.warn = (() => {
            });
        }

        // 设置游戏帧率
        game.frameRate = 30;
        // 初始化层
        this.initStage();
        // 加载资源
        await this.loadRes();
        // // 初始化UI
        // this.initUI();
        // // 初始化场景
        // this.initScene();
        // 初始化游戏
        // this.initGame();
        // // 初始化技能
        // this.initSkills();
    }

    update(dt: number) {
        this._dt++;
        if (this._dt > skip) {
            this._dt = 0;
            this.skyBox.rotationAngle += dt * 1;
        }
    }

    public overwriteDirector(): void {
        // 保存原始主循环tick函数
        const originalTick = director.tick;
        // 重写tick函数
        director.tick = (dt: number) => {
            // 将时间增量dt乘以时间缩放系数
            dt *= Global.timeScale;
            // 调用原始tick函数，使用修改后的时间值
            originalTick.call(director, dt);
        }
    }

    public initStage(): void {
        for (let index = 0; index <= 5; index++) {
            const node = new Node("stage" + index);
            node.parent = this.node;
            Global.stage[index] = this.stage[index] = node;
        }
    }

    public async loadRes(): Promise<void> {
        await ResMgr.ins.loadBundle(6, 0.02);
        await ResMgr.ins.loadRes(6, Assets.Skills, 0.5);
        // await ResMgr.ins.loadRes(6, Assets.Clips, 0.3);
        // await ResMgr.ins.loadRes(6, Assets.Json, 0.05);
        // await ResMgr.ins.loadRes(6, Assets.Prefabs, 0.05);
    }

    public initUI(): void {
        // const scene = director.getScene();
        // const canvas = scene.getComponentInChildren(Canvas).node;
        // for (var i = 0; i <= 5; i++) {
        //     /* if layer0 exist, we clone it, otherwise create a new one */
        //     const node = this.layer[0] ? instantiate(this.layer[0]) : Util.createUI();
        //     node.name = "layer" + i;
        //     node.parent = canvas;
        //     Global.layer[i] = this.layer[i] = node;
        // }
    }

    public initScene(): void {
        // PoolMgr.ins.getNode("scene", Global.stage[0]);
        // Global.LoadingRate += 0.05;
    }

    public initGame(): void {
        // Global.camera = this.camera;

        // postions.forEach((pos, i) => {
        //     const name = (i === 0) ? "player" : "monster";
        //     const char = PoolMgr.ins.getNode(name, Global.stage[1], pos);
        //     char.getComponent(RoleCtrl).init();

        // });

        // Global.LoadingRate += 0.05;
    }

    public initSkills(): void {
        // const skillConfig = ResMgr.ins.getJson("skill") as skillConfig[];
        // skillConfig.forEach((skill) => {
        //     const btn = PoolMgr.ins.getNode("skillIcon", this.skillBtns);
        //     const skillCtrl = btn.getComponent(SkillCtrl);
        //     skillCtrl.init(skill);
        // });
    }

}


