import { __private, AudioClip, Enum, JsonAsset, Material, Node, Prefab, SpriteAtlas } from "cc";

const EventType = Enum({ 
    TweenCam: "TweenCam",
    ScreenShake: "ScreenShake",
    PlayAnm: 'PlayAnm',
});

export type AssetType = {
    //@ts-ignore
    type: __private._cocos_core_asset_manager_shared__AssetType,
    path: string
};

export const Assets = ({
    Skills: { type: Prefab, path: "skills/" } as AssetType,
    Json: { type: JsonAsset, path: "jsons/" } as AssetType,
    Clips: { type: AudioClip, path: "clips/" } as AssetType,
    Atlas: { type: SpriteAtlas, path: "Atlas" } as AssetType,
    Material: { type: Material, path: "Materials" } as AssetType,
    Prefabs: { type: Prefab, path: "prefabs/" } as AssetType,
});

const CharactorType = Enum({
    None: 0,
    Player: 1,
    Chest: 2,
    Monster: 3
});

export type baseAtk = {
    node?: Node,
    dmg: number,
    crit: number,
};

export type bonusAtk = {
    /* if dmg >0 do hurt targets, else heal targets */
    scale: number,
    shake?: number,
    freeze?: number,
    fire?: number,
    veno?: number,
    ice?: number,
    sword?: number,
    wave?: number,
    thunder?: number,
    dark?: number,
    light?: number,
    repeat?: number,
};

export type skillConfig = bonusAtk & {
    id: number,
    name: string,
    des: string,
    time: number,
    cd: number,
    offset: number,
    delay: number,
    mana?: number,
    clip?: string,
    clipdelay?: number
};

/**
* 音乐路径
*/
const Clip = Enum({
    die: "die",
    btn: "btn",
    sword: "feijian",
    wave: "wave",
    reward: "reward",
    win: "win",
    lose: "lose",
    slash1: "slash1",
    slash2: "slash2",
    hurt: "hurt",
    bgm: "bgm",
    gold: "gold",
    equip: "equip",
    buy: "buy",
    recycle: "recycle",
    merge: "merge",
    tick: "tick",
    teleport: "teleport",
    footstep: "footstep",
    buff: "buff",
});

export { EventType, CharactorType, Clip };