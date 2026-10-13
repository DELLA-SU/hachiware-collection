import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source=await readFile(new URL('../app/motion-sounds.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let fetches=0,starts=0,stops=0,time=0,decodeResolve;
const stored=new Map(),audioSources=[];
class AudioContext {
 state='running';destination={};
 resume(){this.state='running';return Promise.resolve();}
 decodeAudioData(){return new Promise(resolve=>{decodeResolve=resolve;});}
 createBufferSource(){const source={connect(){},start(){++starts;},stop(){++stops;source.onended?.();}};audioSources.push(source);return source;}
}
const context={exports:{},require:()=>({assetUrl:path=>path}),AudioContext,Date:{now:()=>time+=100},navigator:{userActivation:{isActive:true}},localStorage:{getItem:key=>stored.get(key)??null,setItem:(key,value)=>stored.set(key,value)},fetch:async()=>{++fetches;return{ok:true,arrayBuffer:async()=>new ArrayBuffer(4)};}};
vm.runInNewContext(compiled,context);
const api=context.exports;
const flush=()=>new Promise(resolve=>setImmediate(resolve));
api.setMotionSound(false);await api.playMotion('gacha');assert.equal(fetches,0,'OFF must suppress loading and playback');
api.setMotionSound(true);const canceled=api.playMotion('gacha');await flush();api.setMotionSound(false);api.setMotionSound(true);decodeResolve({});await canceled;assert.equal(starts,0,'Turning OFF cancels an in-flight decode, even after switching ON again');
await api.playMotion('gacha');assert.equal(starts,1);api.setMotionSound(false);assert.equal(stops,1,'Turning OFF stops the current draw sound');assert.equal(stored.get('hachiware-motion-sound'),'false');assert.equal(api.motionSoundEnabled(),false);
for(const name of ['gacha','gacha-click']){const wav=await readFile(new URL('../public/motion-sounds/'+name+'.wav',import.meta.url));assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.readUInt16LE(22),1);assert.equal(wav.readUInt32LE(24),44100);assert.equal(wav.readUInt16LE(34),16);const seconds=wav.readUInt32LE(40)/88200;assert.equal(seconds,name==='gacha'?2.6:.15);let peak=0;for(let offset=44;offset<wav.length;offset+=2)peak=Math.max(peak,Math.abs(wav.readInt16LE(offset))/32767);assert.ok(peak>.05&&peak<.3);}
console.log('PASS: sound ON/OFF persistence, immediate stop, stale playback cancellation, and 2.6-second gacha audio.');
