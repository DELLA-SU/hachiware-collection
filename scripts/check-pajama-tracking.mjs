import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const source=await readFile(new URL('../app/pajama-tracking.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2020,target:ts.ScriptTarget.ES2020}}).outputText;
const {findPajamaFaces,matchPajamaFaces}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const preset=JSON.parse(await readFile(new URL('../lib/pajama-dance-tracks.json',import.meta.url),'utf8'));
assert.equal(preset.fps,30);
assert.ok(preset.frames.length>100,'The real dance has masks through the full loop.');
for(const frame of preset.frames){
 assert.equal(frame.length,4);
 for(const face of frame.filter(Boolean)){
  assert.ok(face.width>0&&face.height>0&&face.outline.length>=4);
  assert.ok(face.outline.every(([x,y])=>x>=0&&x<=1&&y>=0&&y<=1),'Every mask stays inside the actual video.');
 }
}
const [purple,green,pink,white]=preset.frames[0];
assert.ok(purple.x>pink.x&&pink.x>green.x&&green.x>white.x,'Colour slots stay fixed to the supplied wide shot, rather than left-to-right upload order.');
assert.ok(green.y>purple.y&&green.y>pink.y&&green.y>white.y,'Green is the foreground dancer.');
assert.ok(preset.frames.at(-1).some(face=>!face||face.width/face.height<.7),'Turning faces narrow or disappear, rather than keeping a frozen portrait.');
const width=256,height=144;
function frame(offset=0,hidden=-1){
 const data=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const face=[0,1,2,3].find(i=>i!==hidden&&((x-(36+60*i+offset))/19)**2+((y-65)/24)**2<=1);
  const eye=face!==undefined&&Math.abs(y-62)<3&&(Math.abs(x-(29+60*face+offset))<2||Math.abs(x-(43+60*face+offset))<2);
  const color=eye?[35,30,28]:face===undefined?[246,250,199]:[119,141,135];
  data.set([...color,255],(y*width+x)*4);
 }
 return data;
}
const before=findPajamaFaces(frame(),width,height);
assert.equal(before.length,4,'Four hood openings are detected, with eyes inside them.');
const moved=findPajamaFaces(frame(4),width,height);
const matched=matchPajamaFaces(before,moved);
matched.forEach((face,i)=>{assert.ok(face);assert.ok(Math.abs(face.x-before[i].x-4/width)<.01,'A portrait follows its own member.');});
const occluded=matchPajamaFaces(before,findPajamaFaces(frame(4,1),width,height));
assert.equal(occluded[1],null,'An obscured member stays hidden instead of borrowing another face.');
assert.ok(occluded[0]&&occluded[2]&&occluded[3]);
assert.deepEqual(matchPajamaFaces(before,[]),[null,null,null,null],'No stale portraits over a scene without faces.');
assert.deepEqual(matchPajamaFaces(before,moved.map(face=>({...face,y:face.y+.5}))),[null,null,null,null],'A scene jump does not transfer identities to distant faces.');
console.log('Pajama colour slots, real dance masks, movement, occlusion and scene-cut checks passed.');
