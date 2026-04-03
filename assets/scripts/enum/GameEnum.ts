import { __private, AudioClip, Enum, JsonAsset, Material, Prefab, SpriteAtlas } from "cc";

const EventType = Enum({ 
    TweenCam: "TweenCam",
    ScreenShake: "ScreenShake",
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

export { EventType };