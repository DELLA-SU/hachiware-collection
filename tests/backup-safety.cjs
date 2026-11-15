const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),catalog=JSON.parse(fs.readFileSync(path.join(root,'lib/catalog.json')));
const original={...catalog[0],collected_at:'2026-10-01T00:00:00.000Z',favorite:1};
const initial={photos:[original],hidden:[],requests:{},annotations:{[original.id]:{note:'keep my note',strokes:[],revision:4}}};
let source=fs.readFileSync(path.join(root,'lib/browser-api.ts'),'utf8').replace(/^import .*;$/gm,'').replace(/const database=[\s\S]*?let pending=/,'async function read(){return structuredClone(memory.state)} async function write(state){memory.state=structuredClone(state)} let pending=').replace('export async function apiFetch','async function apiFetch');source+='\nglobalThis.handle=handle';
const c={catalog,assetUrl:p=>'/hachiware-collection/'+p,memory:{state:structuredClone(initial)},structuredClone,URL,Response,Set,Map,Math,Date};vm.createContext(c);vm.runInContext(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText,c);
const restore=body=>c.handle('/api/import',{method:'POST',body:JSON.stringify(body)});
const backup=(photos=[original],annotations={})=>({version:2,photos,annotations});
(async()=>{
 const before=JSON.stringify(c.memory.state);
 for(const invalid of [backup([{...original,id:'unknown'}]),backup([original,original]),backup(Array(2001).fill(original)),backup([{...original,collected_at:'invalid'}]),backup([original],{[original.id]:{note:'x'.repeat(4001),strokes:[]}}),backup([original],{[original.id]:{note:'',strokes:[{color:'#000000',width:4,points:[[Infinity,1]]}]}})]){
  assert.equal((await restore(invalid)).status,400);assert.equal(JSON.stringify(c.memory.state),before,'Rejected imports must not change existing records');
 }
 const incoming={...catalog[1],image_url:'javascript:alert(1)',remote_url:'https://attacker.invalid/private',source:'javascript:alert(1)',collected_at:original.collected_at};
 assert.equal((await restore(backup([incoming]))).status,200);
 const added=c.memory.state.photos.find(p=>p.id===incoming.id);
 assert.equal(added.image_url,'/hachiware-collection/'+catalog[1].image_url);assert.equal(added.source,catalog[1].source);assert.equal(added.remote_url,catalog[1].remote_url);
 assert.deepEqual(c.memory.state.annotations,initial.annotations);assert.equal(c.memory.state.photos[0].favorite,1);
 const markup='<img src=x onerror=alert(1)>';assert.equal((await restore(backup([incoming],{[incoming.id]:{note:markup,strokes:[]}}))).status,200);
 assert.equal(c.memory.state.annotations[incoming.id].note,markup,'Notes remain plain strings');
 console.log('PASS: backup limits, malformed IDs/dates/drawings, atomic rejection, catalog-owned URLs, and preserved private notes/stars.');
})();
