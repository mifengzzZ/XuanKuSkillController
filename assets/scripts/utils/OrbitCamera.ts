import { _decorator, CCBoolean, CCInteger, Component, director, EventMouse, EventTouch, Input, input, lerp, macro, Node, quat, Quat, Touch, tween, Vec2, Vec3 } from 'cc';
import { EDITOR } from 'cc/env';
import { EventType } from '../enum/GameEnum';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('OrbitCamera')
@executeInEditMode(true)
export class OrbitCamera extends Component {

    @property({
        type: CCBoolean,
        tooltip: "是否允许通过触摸进行旋转"
    })
    enableTouch: boolean = false;

    @property({
        type: CCBoolean,
        tooltip: "是否允许通过鼠标滚轮进行缩放"
    })
    enableScaleRadius: boolean = false;

    @property({
        type: CCBoolean,
        tooltip: "是否自动旋转"

    })
    autoRotate: boolean = false;

    @property({
        type: CCInteger,
        tooltip: "自动旋转速度"
    })
    autoRotateSpeed: number = 90;

    /**
     * 以这个点为中心点进行旋转
     */
    @property(Node)
    _target: Node = null;
    @property(Node)
    get target(): Node {
        return this._target;
    }
    set target(value: Node) {
        this._target = value;
        // 设置起始旋转值
        // this._startRotation = vec3(0, 0, 0)
        this._targetRotation.set(this._startRotation);
        // 设置中心点（世界坐标系）
        // this._startRotation = vec3(0, 3, 2)
        this._targetCenter.set(value!.worldPosition);
    }

    private _targetRotation: Vec3 = new Vec3();
    @property(Vec3)
    get targetRotation(): Vec3 {
        return this._targetRotation;
    }
    set targetRotation(v: Vec3) {
        this._targetRotation = v;
    }

    @property(CCBoolean)
    followTargetRotationY: boolean = true;

    @property(Vec2)
    xRotationRange = new Vec2(5, 70);

    @property(CCInteger)
    rotateSpeed: number = 1;

    @property(CCInteger)
    followSpeed: number = 1;

    @property(CCInteger)
    radiusScaleSpeed: number = 1;
    @property(CCInteger)
    minRadius: number = 5;
    @property(CCInteger)
    maxRadius: number = 10;

    @property
    get radius() {
        return this._targetRadius;
    }
    set radius(v) {
        this._targetRadius = v;
    }

    @property
    get preview() {
        return false
    }
    set preview(v) {
        this.resetCam(1);
    }

    private _startRotation: Vec3 = new Vec3();
    private _targetCenter: Vec3 = new Vec3();
    private _center = new Vec3();

    private _touched: boolean = false;
    private _rotation = new Quat();

    private _tempVec3: Vec3 = new Vec3();
    private _tempVec3_2: Vec3 = new Vec3();
    private _tempQuat: Quat = new Quat();
    private _tempVec2: Vec2 = new Vec2();
    private _tempVec2_2: Vec2 = new Vec2();

    private _dis: number = 0;
    
    private _targetRadius: number = 10;
    private _radius: number = 10;

    private _deltaFactor: number = 1 / 200;

    private _shakeRange: number = 0;
    get shakeRange(): number {
        return this._shakeRange;
    }
    set shakeRange(v: number) {
        this._shakeRange = v;
    }
    
    start() {

        // 是否在编辑器下运行
        if (EDITOR) {
            this.resetCam(1);
            return;
        }

        // 开启多点触摸
        macro.ENABLE_MULTI_TOUCH = true;

        // 指定目标上添加震动屏幕事件
        director.on(EventType.ScreenShake, this.shakeScreen, this);
        
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        // 是否开启滚轮缩放
        if (this.enableScaleRadius) {
            // 注册鼠标滚轮事件
            input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        }

        this.resetTargetRotation();

        // 根据欧拉角信息计算四元数
        Quat.fromEuler(this._rotation, this._targetRotation.x, this._targetRotation.y, this._targetRotation.z);

        this._radius = this.radius;

        this.limitRotation();
    }

    protected lateUpdate(dt: number): void {
        this.resetCam(dt);
    }

    public onTouchStart(event?: EventTouch): void {
        this._touched = true;
    }

    public onTouchMove(event?: EventTouch): void {
        if (!this._touched) return;

        const touch = event.touch;

        /* scale radius for mobile multi touch */
        // 处理多点触摸的情况
        const touches = event.getAllTouches();
        if (touches.length > 1) {
            // 获取有变动的触摸点的列表。 注意：第一根手指按下不动，接着按第二根手指，这时候触点信息就只有变动的这根手指（第二根手指）的信息。 
            // 如果需要获取全部手指的信息，请使用 getAllTouches。
            const changedTouches = event.getTouches();

            let touch1: Touch = null;
            let touch2: Touch = null;
            if (changedTouches.length > 1) {
                touch1 = touches[0];
                touch2 = touches[1];
            } else {
                touch1 = touch;
                const diffID = touch1.getID();
                for (let index = 0; index < touches.length; index++) {
                    const element = touches[index];
                    if (element.getID() !== diffID) {
                        touch2 = element;
                        break;
                    }
                }
            }
            touch1.getLocation(this._tempVec2);
            touch2.getLocation(this._tempVec2_2);
            let dis = Vec2.distance(this._tempVec2, this._tempVec2_2);
            let delta = dis - this._dis;
            this._targetRadius += this.radiusScaleSpeed * -Math.sign(delta) * 0.3;
            this._targetRadius = Math.min(this.maxRadius, Math.max(this.minRadius, this._targetRadius));
            this._dis = dis;
        }

        // 获取触点距离上一次事件移动的距离对象，对象包含 x 和 y 属性。
        // 相较于上一次触摸点x/y的偏移距离
        this._tempVec2 = touch!.getDelta();

        this.setRotate(this._tempVec2);
    }

    public onTouchEnd(event?: EventTouch): void {
        this._touched = false;
    }

    public resetTargetRotation(): void {
        // 将相机的目标旋转重置为初始状态
        let targetRotation = this._targetRotation.set(this._startRotation);
        // 是否跟随target旋转Y
        if (this.followTargetRotationY) {
            // 将当前的目标旋转值复制到临时向量 _tempVec3_2 中，同时更新 targetRotation 引用
            targetRotation = this._tempVec3_2.set(targetRotation);
            // 将目标物体的世界旋转转换为欧拉角，并存储到 _tempVec3 中
            Quat.toEuler(this._tempVec3, this.target!.worldRotation);
            // 将目标物体的Y轴旋转角度添加到相机的目标旋转中
            targetRotation.y += this._tempVec3.y;
        }
    }

    public setRotate(v2: Vec2): void {
        // 根据欧拉角计算出四元素
        Quat.fromEuler(this._tempQuat, this._targetRotation.x, this._targetRotation.y, this._targetRotation.z);

        // ----------------------------------------------------------------------------------------
        // 保持旋转的独立性：通过先应用垂直旋转（X轴），然后应用水平旋转（Y轴），
        // 可以避免万向锁问题，并确保每个轴的旋转是独立的。

        // 绕X轴旋转指定四元素（垂直视角调整）
        Quat.rotateX(this._tempQuat, this._tempQuat, -v2.y * this._deltaFactor);
        // 绕世界空间下指定轴旋转四元数（水平视角调整）
        // 该方法属于通用方法，可以指定绕任意轴旋转，其实这里使用rotateY是等效的。
        Quat.rotateAround(this._tempQuat, this._tempQuat, Vec3.UP, -v2.x * this._deltaFactor);
        
        // ----------------------------------------------------------------------------------------

        // 根据四元数计算欧拉角，返回角度 x, y 在 [-180, 180] 区间内, z 默认在 [-90, 90] 区间内，旋转顺序为 YZX，即先绕Y旋转，再绕Z，最后绕X旋转。
        Quat.toEuler(this._targetRotation, this._tempQuat);
        
        this.limitRotation();
    }

    public onMouseWheel(event?: EventMouse): void {
        let scrollY = event.getScrollY();
        this._targetRadius += this.radiusScaleSpeed * -Math.sign(scrollY);
        this._targetRadius = Math.min(this.maxRadius, Math.max(this.minRadius, this._targetRadius));
    }

    /**
     * 缓动屏幕动画
     * @param range 
     */
    public shakeScreen(range: number = 0.5): void {
        const t = range * 0.1;
        let orbitCamera = this.getComponent(OrbitCamera);
        tween(orbitCamera).to(t, { shakeRange: -range }, { easing: 'elasticIn' }).to(t, { shakeRange: range }, { easing: 'elasticOut' }).to(t, { shakeRange: 0 }).start();
    }

    public limitRotation(): void {
        let rotation = this._targetRotation;

        // 限制相机向上看或向下看的角度
        // 最小俯仰角：5°（稍微向下看的角度，接近水平向前）
        // 最大俯仰角：70°（向上看的角度）
        if (rotation.x < this.xRotationRange.x) {
            rotation.x = this.xRotationRange.x;
        } else if (rotation.x > this.xRotationRange.y) {
            rotation.x = this.xRotationRange.y
        }

        // 防止相机发生倾斜
        rotation.z = 0;
    }

    public resetCam(dt: number): void {
        // 复制旋转值
        let targetRotation = this._targetRotation;

        // 自动旋转 && 没有触摸
        // 将自动旋转增量添加到目标旋转的Y轴上
        // this.autoRotateSpeed：自动旋转速度（默认值为90度/秒）
        // dt：帧间隔时间，确保旋转与时间相关而不是与帧率相关
        if (this.autoRotate && !this._touched) {
            targetRotation.y += this.autoRotateSpeed * dt;
        }

        // 设置世界坐标系下的坐标值
        // 中心点
        this._targetCenter.set(this.target.worldPosition);

        // 是否跟随target旋转Y
        /** 这在以下场景中很有用：
         * 第三人称相机：当角色转身时，相机也会跟着转动，保持相对一致的视角
         * 策略游戏：相机跟随单位移动和转向
         * 动作游戏：确保相机视角与角色方向保持一致
        */
        if (this.followTargetRotationY) {
            targetRotation = this._tempVec3_2.set(targetRotation);
            // 根据四元数计算欧拉角，返回角度 x, y 在 [-180, 180] 区间内, z 默认在 [-90, 90] 区间内，旋转顺序为 YZX，即先绕Y旋转，再绕Z，最后绕X旋转。
            Quat.toEuler(this._tempVec3, this.target.worldRotation);
            targetRotation.y += this._tempVec3.y;
        }

        // 根据欧拉角计算出四元素
        // this.targetRotation - 这一次需要旋转多少度
        Quat.fromEuler(this._tempQuat, this.targetRotation.x, this.targetRotation.y, this.targetRotation.z);
        
        // 四元素球面插值
        // 第一个参数 out: Quat - 输出结果存储的位置，这里是 this._rotation
        // 第二个参数 quatA: Quat - 起始四元数，这里是 this._rotation（当前旋转状态）
        // 第三个参数 quatB: Quat - 目标四元数，这里是 this._tempQuat（目标旋转状态）
        // 第四个参数 t: number - 插值系数，这里是 dt * 7 * this.rotateSpeed
        // 7 是一个调节平滑度的常数、this.rotateSpeed 是用户定义的旋转速度参数
        Quat.slerp(this._rotation, this._rotation, this._tempQuat, dt * 7 * this.rotateSpeed);

        // 逐元素向量线性插值： A + t * (B - A)
        // 第一个参数 out: Vec3 - 输出结果存储的位置，这里是 this._center
        // 第二个参数 a: Vec3 - 起始向量，这里是 this._center（当前中心位置）
        // 第三个参数 b: Vec3 - 目标向量，这里是 this._targetCenter（目标中心位置）
        // 第四个参数 t: number - 插值系数，这里是 dt * 5 * this.followSpeed
        // 5 是一个调节平滑度的常数、this.followSpeed 是用户定义的跟随速度参数
        Vec3.lerp(this._center, this._center, this._targetCenter, dt * 5 * this.followSpeed);

        // 计算实际半径：目标半径加上震动范围，用于确定相机距离目标点的距离
        const radius = this._targetRadius + this._shakeRange;

        // 两个数之间的线性插值
        // 使用线性插值使相机半径平滑过渡到目标半径 - dt * 10 是插值系数，确保过渡过程与时间相关
        this._radius = lerp(this._radius, radius, dt * 10);

        // 向量四元数乘法
        // 将 Z 轴负方向向量（Vec3.FORWARD = (0, 0, -1)）按照相机的旋转四元数进行变换
        // 这一步计算出相机相对于其旋转方向的前向向量
        Vec3.transformQuat(this._tempVec3, Vec3.FORWARD, this._rotation);

        // 向量标量乘法
        // 前向向量按比例放大到指定的半径长度
        // 现在 this._tempVec3 表示从目标点指向相机位置的向量
        Vec3.multiplyScalar(this._tempVec3, this._tempVec3, this._radius);

        // 向量加法
        // 将半径向量加到相机关注的中心点上
        // 现在 _tempVec3 包含了相机的实际世界坐标位置
        this._tempVec3.add(this._center);

        // 设置相机节点的位置为计算出的世界坐标
        this.node.position = this._tempVec3;
        // 设置相机朝向,让相机朝向目标中心点，确保相机始终看向关注的目标
        this.node.lookAt(this._center);
    }
}


