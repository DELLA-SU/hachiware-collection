import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const rows=new Map((await readFile(new URL('../app/translations-data.tsv',import.meta.url),'utf8')).trimEnd().split('\n').map(line=>{const [key,...values]=line.split('|');return[key,values];}));
for(const [key,values] of rows){assert.equal(values.length,3,key);assert.ok(values.every(value=>value.length),key);}
for(const name of ['page','gacha-hero','photo-window','photo-memo','photo-zoom','music-tv','capsule-intro','capsule-scene','install-guide','collection-guide','analytics-consent','certificate-studio','site-settings']){
 const path=new URL('../app/'+name+'.tsx',import.meta.url),source=await readFile(path,'utf8'),ast=ts.createSourceFile(path.pathname,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(ast)==='t'&&ts.isStringLiteral(node.arguments[0]))assert.ok(rows.has(node.arguments[0].text),name+': '+node.arguments[0].text);ts.forEachChild(node,visit);}visit(ast);
}
const keywords=JSON.parse(await readFile(new URL('../lib/collection-keywords.json',import.meta.url),'utf8'));for(const item of keywords)assert.ok(rows.has(item.name),'Missing character name: '+item.name);
console.log('All UI translation keys and character names are covered in three additional languages.');
