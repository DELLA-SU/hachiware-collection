import catalog from './catalog.json';
import {assetUrl} from '../app/asset-url';
type State={photos:any[];hidden:string[];requests:Record<string,string>;annotations:Record<string,any>;last?:string};
const database=new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('hachiware-public',1);r.onupgradeneeded=()=>r.result.createObjectStore('records');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
async function read(){const db=await database;return new Promise<State>((resolve,reject)=>{const r=db.transaction('records').objectStore('records').get('collection');r.onsuccess=()=>resolve(r.result||{photos:catalog.slice(0,3).map((p,i)=>({...p,image_url:assetUrl(p.image_url),collected_at:new Date(Date.now()-i*1000).toISOString(),favorite:0})),hidden:[],requests:{},annotations:{}});r.onerror=()=>reject(r.error);});}
async function write(state:State){const db=await database;return new Promise<void>((resolve,reject)=>{const tx=db.transaction('records','readwrite');tx.objectStore('records').put(state,'collection');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
let pending=Promise.resolve();
function serial<T>(work:()=>Promise<T>):Promise<T>{const result=pending.then(work,work);pending=result.then(()=>{},()=>{});return result;}
const json=(value:unknown,status=200)=>Response.json(value,{status});
async function handle(input:string,init?:RequestInit){
 const path=new URL(input,'https://local.invalid'),state=await read(),b=init?.body?JSON.parse(String(init.body)):{};
 const visible=()=>state.photos.filter(p=>!state.hidden.includes(p.id)).sort((a,b)=>b.collected_at.localeCompare(a.collected_at));
 if(path.pathname==='/api/collection'){await write(state);return json({photos:visible(),mode:'browser'});}
 if(path.pathname==='/api/collect'){
  if(!/^[a-zA-Z0-9-]{16,80}$/.test(b.request_id||''))return json({error:'수집 요청 번호를 확인해 주세요.'},400);
  const prior=state.requests[b.request_id];if(prior)return json({photo:state.photos.find(p=>p.id===prior),replayed:true});
  const newPhotos=catalog.filter(p=>!state.photos.some(s=>s.id===p.id));let existing=!newPhotos.length;
  let choices:any[]=existing?visible().filter(p=>p.id!==state.last):newPhotos;if(!choices.length&&existing)choices=visible();
  if(!choices.length)return json({error:'남아 있는 사진이 없어요. 삭제한 사진을 복원해 주세요.'},404);
  let photo=choices[Math.floor(Math.random()*choices.length)];
  if(!existing){photo={...photo,image_url:assetUrl(photo.image_url),collected_at:new Date().toISOString(),favorite:0};state.photos.push(photo);}
  state.last=photo.id;state.requests[b.request_id]=photo.id;
  const keys=Object.keys(state.requests);keys.slice(0,Math.max(0,keys.length-200)).forEach(k=>delete state.requests[k]);
  await write(state);return json({photo,existing,replayed:false});
 }
 const id=path.searchParams.get('id')||b.id,photo=state.photos.find(p=>p.id===id);
 if(!photo)return json({error:'사진을 찾지 못했어요.'},404);
 if(path.pathname==='/api/favorite'){photo.favorite=b.favorite?1:0;await write(state);return json({favorite:photo.favorite});}
 if(path.pathname==='/api/remove'){state.hidden=b.restore?state.hidden.filter(i=>i!==id):[...new Set([...state.hidden,id])];await write(state);return json({ok:true});}
 if(path.pathname==='/api/annotation'){
  const a=state.annotations[id]||{note:'',strokes:[],revision:0};if(!init?.method||init.method==='GET')return json(a);
  let points=0;
  const valid=typeof b.note==='string'&&b.note.length<=4000&&Number.isSafeInteger(b.revision)&&Array.isArray(b.strokes)&&b.strokes.length<=300&&b.strokes.every((s:any)=>s&&/^#[a-fA-F0-9]{6}$/.test(s.color)&&[2,4,8,12].includes(s.width)&&Array.isArray(s.points)&&s.points.length>0&&s.points.length<=5000&&(points+=s.points.length)<=20000&&s.points.every((p:any)=>Array.isArray(p)&&p.length===2&&p.every((n:any)=>Number.isFinite(n)&&n>=0&&n<=1000)));
  if(!valid)return json({error:'메모 또는 드로잉 형식을 확인해 주세요.'},400);
  if(a.revision!==b.revision)return json({error:'다른 창에서 바뀐 메모가 있어요. 사진을 다시 열어 주세요.'},409);
  const next={note:b.note,strokes:b.strokes,revision:a.revision+1};state.annotations[id]=next;await write(state);return json({revision:next.revision});
 }
 return json({error:'지원하지 않는 요청입니다.'},404);
}
export async function apiFetch(input:string,init?:RequestInit){try{return await serial(()=>navigator.locks?navigator.locks.request('hachiware-collection',()=>handle(input,init)):handle(input,init));}catch{return json({error:'브라우저에 저장하지 못했어요. 저장 공간과 브라우저 설정을 확인해 주세요.'},503);}}
