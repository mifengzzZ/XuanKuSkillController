import { _decorator, AudioSource, Component, Node } from 'cc';
import { ResMgr } from './ResMgr';
import { Clip } from '../enum/GameEnum';
const { ccclass, property } = _decorator;

@ccclass('AudioMgr')
export class AudioMgr {
    
    /**
     * 音乐和单次音效播放
     */
    private _audioComp: AudioSource = null;

    /**
     * 循环音效播放
     */
    private _audioLoopComp: AudioSource = null;

    private _curLoopAudioName: string = "";

    private audioTime =new Map<string,number>;

    private static _ins: AudioMgr = null!;

    public static get ins() {
        if (!this._ins) {
            this._ins = new AudioMgr();
            this._ins.initAudio();
        }

        return this._ins;
    }

    private initAudio() {
        this._audioComp = new AudioSource();
        this._audioComp.loop = true;
        this._audioLoopComp = new AudioSource();
        this._audioLoopComp.loop = true;
    }

    public async bgm() {
        if (this._audioComp.clip) {
            this._audioComp.play();
            return;
        }

        await ResMgr.ins.loadBgm()

        this._audioComp.clip = ResMgr.ins.getClip(Clip.bgm);
        this._audioComp.play();
    }

    public playBgm() {
        if (this._audioComp.clip) {
            this._audioComp.play();
        }
    }

    public stop() {
        this._audioComp.stop();
    }

    public play(audio: string, volume = 1) {
        const last =this.audioTime.get(audio);
        const now = Date.now();
        if(!last||(now-last)>50){
            this.audioTime.set(audio,now);
            const clip = ResMgr.ins.getClip(audio);
            this._audioComp.playOneShot(clip, volume);
        }
       
    }

    public async playLoopSound(audio: string): Promise<void> {
        let clip = ResMgr.ins.getClip(audio);
        this._audioLoopComp.stop();
        this._audioLoopComp.clip = clip;
        this._audioLoopComp.play();
        this._curLoopAudioName = audio;
    }

    public async stopLoopSound(): Promise<void> {
        this._audioLoopComp.stop();
    }

    public get curLoopAudioName(): string {
        return this._curLoopAudioName;
    }

    public isLoopAudioPlaying(): boolean {
        return this._audioLoopComp.playing;
    }

}


