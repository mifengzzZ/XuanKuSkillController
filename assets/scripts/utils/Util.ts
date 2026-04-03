import { _decorator, Component, Layers, Node, UITransform, view, Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Util')
export class Util {
    
    public static createUI(name: string = "uiNode", layer: number = Layers.Enum.UI_2D): Node {
        const size = view.getVisibleSize();
        const node = new Node(name)
        const transfrom = node.addComponent(UITransform);
        transfrom.setContentSize(size);
        const widget = node.addComponent(Widget);
        widget.isAlignLeft = widget.isAlignTop = widget.isAlignTop = widget.isAlignBottom = true;
        widget.right = widget.left = widget.top = widget.bottom = 0;
        node.layer = layer;
        return node;
    }

}


