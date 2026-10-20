import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const root=new URL('../',import.meta.url);
const catalog=JSON.parse(await readFile(new URL('lib/catalog.json',root),'utf8'));
const available=catalog.filter(p=>p.draw_enabled!==false);
const source=(await readFile(new URL('lib/browser-api.ts',root),'utf8')).replace(/^import .*;$/gm,'').replace(/const database=[\s\S]*?let pending=/,'async function read(){return structuredClone(memory.state)} async function write(state){memory.state=structuredClone(state)} let pending=').replace('export async function apiFetch','async function apiFetch')+'\nglobalThis.handle=handle;';
let clock=Date.parse('2026-10-20T14:59:00Z');
class Clock extends Date{constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;}}
const oldDate='2026-10-01T00:00:00Z';
const initial={photos:[],hidden:[],requests:{},annotations:{}};
function create(state=initial){const context={catalog,assetUrl:p=>'/hachiware-collection/'+p,memory:{state:structuredClone(state)},structuredClone,URL,Response,Set,Map,Math,Date:Clock,Intl};vm.createContext(context);vm.runInContext(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText,context);return context;}
let number=0;
const draw=async context=>{const response=await context.handle('/api/collect',{method:'POST',body:JSON.stringify({request_id:'daily-draw-test-'+String(++number).padStart(8,'0')})});return {status:response.status,...await response.json()};};
const c=create();const ids=new Set();
for(let i=0;i<available.length;i++){const result=await draw(c);assert.equal(result.status,200);assert(!ids.has(result.photo.id),'same image repeated within a Korean calendar day');ids.add(result.photo.id);}
assert.equal(ids.size,available.length);assert.equal(c.memory.state.photos.length,available.length);
const before=structuredClone(c.memory.state);
assert.equal((await draw(c)).status,409);assert.deepEqual(c.memory.state,before,'exhaustion must not mutate records');
// Reloading and deleting a card must not reset the daily exclusion.
const reloaded=create({...before,hidden:[...ids]});assert.equal((await draw(reloaded)).status,409);
// At Korean midnight the same catalog becomes eligible again, with one record per image.
clock=Date.parse('2026-10-20T15:00:00Z');
const tomorrow=await draw(c);assert.equal(tomorrow.status,200);assert.equal(tomorrow.existing,true);assert.equal(c.memory.state.photos.length,available.length);
assert.equal(c.memory.state.daily_draws.day,'2026-10-21');assert.equal(c.memory.state.daily_draws.ids.length,1);
const armor=available.find(p=>p.character==='armor-pochette');
const previous={...initial,photos:available.map(p=>({...p,collected_at:oldDate,favorite:p.id===armor.id?1:0,...(p.id===armor.id?{met_at:new Clock().toISOString()}: {})})),draw_count:5,annotations:{[armor.id]:{note:'keep me',strokes:[],revision:2}}};
const legacy=create(previous);for(let i=0;i<available.length-1;i++)assert.notEqual((await draw(legacy)).photo.id,armor.id,'previous-version encounter must seed today');
assert.equal((await draw(legacy)).status,409);assert.equal(legacy.memory.state.photos.length,available.length);assert.equal(legacy.memory.state.photos.find(p=>p.id===armor.id).favorite,1);assert.deepEqual(legacy.memory.state.annotations,previous.annotations);
// A depleted side-character category must fall back to an unseen main character.
const fallback=create({...initial,draw_count:5,photos:available.filter(p=>!['hachiware','chiikawa','usagi','friends'].includes(p.character)).map(p=>({...p,collected_at:new Clock().toISOString()}))});
const next=await draw(fallback);assert(['hachiware','chiikawa','usagi','friends'].includes(next.photo.character));
// Saving the exact desktop result participates in the same exclusion and is idempotent.
const bridge=create();const request={method:'POST',body:JSON.stringify({id:armor.id,request_id:'desktop-save-daily-test'})};
assert.equal((await bridge.handle('/api/desktop-photo',request)).status,200);
assert.equal((await bridge.handle('/api/desktop-photo',request)).status,200);assert.equal(bridge.memory.state.photos.length,1);
for(let i=0;i<available.length-1;i++)assert.notEqual((await draw(bridge)).photo.id,armor.id);
assert.equal((await draw(bridge)).status,409);
console.log('PASS: all '+available.length+' photos once per Korean day, midnight reset, reload/deletion protection, old-record migration, category fallback, notes/stars retained and desktop save retries.');
