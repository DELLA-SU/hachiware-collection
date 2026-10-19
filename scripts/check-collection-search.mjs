import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const keywords=JSON.parse(await read('lib/collection-keywords.json'));
const translations=Object.fromEntries((await read('app/translations-data.tsv')).trimEnd().split('\n').map(line=>{const [key,en,zh,ja]=line.split('|');return[key,{en,zh,ja}];}));
const source=ts.transpileModule(await read('app/collection-search.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const context={exports:{},require:name=>name.includes('collection-keywords')?{default:keywords}:{translations}};
vm.runInNewContext(source,context);
const matches=context.exports.photoMatchesSearch;
const photo={character:'hachiware',title:'Photo',source_kind:'Pinterest'};
for(const entry of keywords){
 for(const name of [entry.name,entry.japanese,...Object.values(translations[entry.name])]){
  assert.equal(matches({...photo,character:entry.id},'002','2026-10-19',name),true,entry.id+': '+name);
 }
}
assert.equal(matches(photo,'002','2026-10-19','小八'),true);
assert.equal(matches(photo,'002','2026-10-19','Usagi'),false);
assert.equal(matches(photo,'002','2026-10-19','#002'),true);
assert.equal(matches(photo,'002','2026-10-19','003'),false);
assert.equal(matches(photo,'002','2026-10-19','2026.10.19'),true);
assert.equal(matches(photo,'002','2026-10-19','2026/10'),true);
assert.equal(matches(photo,'002','2026-10-19','2026-10-18'),false);
assert.equal(matches(photo,'002','2026-10-19','hachiware pinterest'),true);
assert.equal(matches(photo,'002','2026-10-19','小八 pinterest'),true);
console.log('PASS: every character name in all four languages, mixed-language/source queries, card numbers and dates.');
