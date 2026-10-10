'use client';
import {useEffect,useRef,useState} from 'react';
import {ZoomIn,ZoomOut,RotateCcw} from 'lucide-react';

export default function PhotoZoom({src,alt,onActivate}:{src:string;alt:string;onActivate?:()=>void}){
 const [zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0});
 const viewport=useRef<HTMLDivElement>(null),value=useRef(1),points=useRef(new Map<number,{x:number;y:number}>()),gesture=useRef<{distance:number;zoom:number}|null>(null);
 const tap=useRef<{x:number;y:number;valid:boolean}|null>(null);
 function constrain(x:number,y:number,scale=value.current){const box=viewport.current;const mx=(box?.clientWidth||0)*(scale-1)/2,my=(box?.clientHeight||0)*(scale-1)/2;return {x:Math.max(-mx,Math.min(mx,x)),y:Math.max(-my,Math.min(my,y))};}
 function change(next:number){const scale=Math.max(1,Math.min(4,Math.round(next*100)/100));value.current=scale;setZoom(scale);setPan(p=>constrain(p.x,p.y,scale));}
 function reset(){change(1);setPan({x:0,y:0});}
 useEffect(()=>{reset();points.current.clear();gesture.current=null;},[src]);
 useEffect(()=>{const el=viewport.current;if(!el)return;const wheel=(e:WheelEvent)=>{e.preventDefault();change(value.current+(e.deltaY<0?.2:-.2));};el.addEventListener('wheel',wheel,{passive:false});const resize=()=>setPan(p=>constrain(p.x,p.y));window.addEventListener('resize',resize);return()=>{el.removeEventListener('wheel',wheel);window.removeEventListener('resize',resize);};},[]);
 function distance(){const [a,b]=[...points.current.values()];return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;}
 return <div className="photo-zoom">
  <div ref={viewport} className={'zoom-viewport '+(zoom>1?'is-zoomed':'')} role="group" aria-label="사진 확대 영역" tabIndex={0}
   onKeyDown={e=>{if(onActivate&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onActivate();}else if(e.key==='+'||e.key==='='){e.preventDefault();change(value.current+.25);}else if(e.key==='-'){e.preventDefault();change(value.current-.25);}else if(e.key==='0'){e.preventDefault();reset();}else if(value.current>1&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();setPan(p=>constrain(p.x+(e.key==='ArrowLeft'?30:e.key==='ArrowRight'?-30:0),p.y+(e.key==='ArrowUp'?30:e.key==='ArrowDown'?-30:0)));}}}
   onDoubleClick={()=>value.current>1?reset():change(2)}
   onPointerDown={e=>{if(e.button!==0)return;tap.current=points.current.size?null:{x:e.clientX,y:e.clientY,valid:true};points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});e.currentTarget.setPointerCapture(e.pointerId);if(points.current.size===2)gesture.current={distance:distance(),zoom:value.current};}}
   onPointerMove={e=>{if(tap.current&&Math.hypot(e.clientX-tap.current.x,e.clientY-tap.current.y)>5)tap.current.valid=false;const prev=points.current.get(e.pointerId);if(!prev)return;points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.current.size===2&&gesture.current){const g=gesture.current;if(g.distance)change(g.zoom*distance()/g.distance);}else if(value.current>1)setPan(p=>constrain(p.x+e.clientX-prev.x,p.y+e.clientY-prev.y));}}
   onPointerUp={e=>{if(tap.current?.valid&&points.current.size===1)onActivate?.();tap.current=null;points.current.delete(e.pointerId);gesture.current=null;}} onPointerCancel={e=>{tap.current=null;points.current.delete(e.pointerId);gesture.current=null;}}>
   <img src={src} alt={alt} draggable={false} style={{transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}}/>
  </div>
  <div className="zoom-controls" aria-label="사진 확대 도구"><button onClick={()=>change(value.current-.25)} disabled={zoom<=1} aria-label="사진 축소"><ZoomOut size={16}/></button><output aria-label="사진 확대율">{Math.round(zoom*100)}%</output><button onClick={()=>change(value.current+.25)} disabled={zoom>=4} aria-label="사진 확대"><ZoomIn size={16}/></button><button onClick={reset} aria-label="사진 확대 초기화"><RotateCcw size={14}/></button><span>휠·핀치로 확대 · 드래그로 이동</span></div>
 </div>;
}
