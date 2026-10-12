const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),catalog=JSON.parse(fs.readFileSync(path.join(root,'lib/catalog.json')));
const originals=catalog.slice(0,55).map((p,i)=>({...p,collected_at:new Date(Date.UTC(2026,9,1,0,0,i)).toISOString(),favorite:i===0?1:0}));
const initial={photos:originals,hidden:[],requests:{},annotations:{[originals[0].id]:{note:'소중한 메모',strokes:[],revision:2}}};
let source=fs.readFileSync(path.join(root,'lib/browser-api.ts'),'utf8').replace(/^import .*;$/gm,'').replace(/const database=[\s\S]*?let pending=/,'async function read(){return structuredClone(memory.state)} async function write(state){memory.state=structuredClone(state)} let pending=').replace('export async function apiFetch','async function apiFetch');source+='\nglobalThis.collect=handle';
const context={catalog,assetUrl:p=>'/hachiware-collection/'+p,memory:{state:structuredClone(initial)},structuredClone,URL,Response,Math,Date,Set,Map};vm.createContext(context);vm.runInContext(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText,context);
(async()=>{
 assert(catalog.length>55,'More than 55 unique source photos are required');assert.equal(new Set(catalog.map(p=>p.id)).size,catalog.length);
 for(const p of catalog)assert(fs.existsSync(path.join(root,'public',p.image_url)),'Missing image '+p.id);
 for(let count=56;count<=catalog.length;count++){
  const request_id='request-'+count,r=await context.collect('/api/collect',{method:'POST',body:JSON.stringify({request_id})}),j=await r.json();assert.equal(r.status,200);assert.equal(j.existing,false);assert.equal(context.memory.state.photos.length,count);
  const repeat=await(await context.collect('/api/collect',{method:'POST',body:JSON.stringify({request_id})})).json();assert.equal(repeat.photo.id,j.photo.id);assert.equal(context.memory.state.photos.length,count);
 }
 assert.equal(new Set(context.memory.state.photos.map(p=>p.id)).size,catalog.length);
 for(const p of originals)assert.deepEqual(context.memory.state.photos.find(q=>q.id===p.id),p);
 assert.deepEqual(context.memory.state.annotations,initial.annotations);
 const exhausted=await(await context.collect('/api/collect',{method:'POST',body:JSON.stringify({request_id:'exhausted'})})).json();assert.equal(exhausted.existing,true);assert.equal(context.memory.state.photos.length,catalog.length);
 console.log('PASS: 55 → '+catalog.length+' distinct records; request replay; dates, stars and notes preserved; every asset present.');
})();
