const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),catalog=JSON.parse(fs.readFileSync(path.join(root,'lib/catalog.json')));const photo={...catalog[0],collected_at:'2026-10-01T00:00:00.000Z',favorite:1};
const initial={photos:[photo],hidden:[photo.id],requests:{},annotations:{[photo.id]:{note:'내 메모',strokes:[],revision:3}}};
let source=fs.readFileSync(path.join(root,'lib/browser-api.ts'),'utf8').replace(/^import .*;$/gm,'').replace(/const database=[\s\S]*?let pending=/,'async function read(){return structuredClone(memory.state)} async function write(state){memory.state=structuredClone(state)} let pending=').replace('export async function apiFetch','async function apiFetch');source+='\nglobalThis.handle=handle';
const c={catalog,assetUrl:p=>'/hachiware-collection/'+p,memory:{state:structuredClone(initial)},structuredClone,URL,Response,Set,Map,Math,Date};vm.createContext(c);vm.runInContext(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText,c);
const send=(id,request_id)=>c.handle('/api/desktop-photo',{method:'POST',body:JSON.stringify({id,request_id})});
(async()=>{
 const existing=await(await send(photo.id,'desktop-sync-existing-request')).json();assert(existing.existing);assert.equal(c.memory.state.photos.length,1);assert.equal(c.memory.state.photos[0].collected_at,photo.collected_at);assert.equal(c.memory.state.photos[0].favorite,1);assert.equal(c.memory.state.photos[0].met_at,existing.photo.met_at);assert.deepEqual(c.memory.state.annotations,initial.annotations);assert.equal(c.memory.state.hidden.length,0);
 const saved=JSON.stringify(c.memory.state);assert.equal((await send('unknown','desktop-sync-unknown-request')).status,400);assert.equal(JSON.stringify(c.memory.state),saved);
 const newer=await(await send(catalog.at(-1).id,'desktop-sync-new-photo-request')).json();assert(!newer.existing);assert.equal(c.memory.state.photos.length,2);await send(catalog.at(-1).id,'desktop-sync-new-photo-request');assert.equal(c.memory.state.photos.length,2);
 const list=await(await c.handle('/api/collection')).json();assert(list.photos.some(p=>p.id===catalog.at(-1).id));assert.deepEqual(c.memory.state.annotations,initial.annotations);
 console.log('PASS: desktop exact-photo import, no duplicates, revisit timestamp, dates/stars/notes preserved, restore hidden, bad-ID rollback, request retry.');
})();
