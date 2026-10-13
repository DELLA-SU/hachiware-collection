const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),catalog=JSON.parse(fs.readFileSync(path.join(root,'lib/catalog.json'))),eligible=catalog.filter(p=>p.draw_enabled!==false);const main=p=>['hachiware','chiikawa','usagi','friends'].includes(p.character);
const originals=catalog.slice(0,55).map((p,i)=>({...p,collected_at:new Date(Date.UTC(2026,9,1,0,0,i)).toISOString(),favorite:i===0?1:0})),initial={photos:originals,hidden:[],requests:{},annotations:{[originals[0].id]:{note:'소중한 메모',strokes:[],revision:2}}};
let source=fs.readFileSync(path.join(root,'lib/browser-api.ts'),'utf8').replace(/^import .*;$/gm,'').replace(/const database=[\s\S]*?let pending=/,'async function read(){return structuredClone(memory.state)} async function write(state){memory.state=structuredClone(state)} let pending=').replace('export async function apiFetch','async function apiFetch');source+='\nglobalThis.collect=handle';const c={catalog,assetUrl:p=>'/hachiware-collection/'+p,memory:{state:structuredClone(initial)},structuredClone,URL,Response,Math,Date,Set,Map};vm.createContext(c);vm.runInContext(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText,c);
(async()=>{
 assert(eligible.length>55);assert.equal(new Set(catalog.map(p=>p.id)).size,catalog.length);for(const p of catalog)assert(fs.existsSync(path.join(root,'public',p.image_url)));
 for(let call=0;call<eligible.length*6;call++){
  const request_id='collection-test-request-'+call,r=await c.collect('/api/collect',{method:'POST',body:JSON.stringify({request_id})}),j=await r.json();assert.equal(r.status,200);assert.notEqual(j.photo.draw_enabled,false);assert.equal(main(j.photo),call%6<5,'Five main characters then one support character');
  const count=c.memory.state.photos.length,retry=await(await c.collect('/api/collect',{method:'POST',body:JSON.stringify({request_id})})).json();assert.equal(retry.photo.id,j.photo.id);assert.equal(c.memory.state.photos.length,count);
  if(eligible.every(p=>c.memory.state.photos.some(q=>q.id===p.id)))break;
 }
 assert(eligible.every(p=>c.memory.state.photos.some(q=>q.id===p.id)));assert.equal(new Set(c.memory.state.photos.map(p=>p.id)).size,c.memory.state.photos.length);
 for(const p of originals){const q=c.memory.state.photos.find(x=>x.id===p.id);assert.equal(q.collected_at,p.collected_at);assert.equal(q.favorite,p.favorite);}assert.deepEqual(c.memory.state.annotations,initial.annotations);
 console.log('PASS: illustration-only draws; exact 5:1 cycle; all '+eligible.length+' drawable photos reached; dates, stars, notes, retries preserved.');
})();
