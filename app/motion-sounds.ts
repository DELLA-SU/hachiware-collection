import {assetUrl} from './asset-url';
let context:AudioContext|null=null,enabled=true,epoch=0;
const playing=new Set<AudioBufferSourceNode>();
const buffers=new Map<string,Promise<AudioBuffer>>();let last=0;
export function setMotionSound(enabledNow:boolean){enabled=enabledNow;++epoch;if(!enabled){for(const source of playing){try{source.stop();}catch{}}playing.clear();}try{localStorage.setItem('hachiware-motion-sound',String(enabled));}catch{}}
export function motionSoundEnabled(){try{enabled=localStorage.getItem('hachiware-motion-sound')!=='false';}catch{}return enabled;}
export async function playMotion(name:'paper'|'reveal'|'star'|'switch'|'pencil'|'gacha'|'gacha-click'){
 if(!enabled)return;const now=Date.now();if(now-last<50)return;last=now;const requestEpoch=epoch;
 try{context ||= new AudioContext();if(context.state==='suspended'){if(!navigator.userActivation?.isActive)return;await context.resume();}const ctx=context;
 if(!buffers.has(name))buffers.set(name,fetch(assetUrl('motion-sounds/'+name+'.wav')).then(r=>{if(!r.ok)throw Error();return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)));
 const buffer=await buffers.get(name)!;if(!enabled||requestEpoch!==epoch)return;const source=ctx.createBufferSource();source.buffer=buffer;source.connect(ctx.destination);playing.add(source);source.onended=()=>playing.delete(source);source.start();
 }catch{buffers.delete(name);}
}
