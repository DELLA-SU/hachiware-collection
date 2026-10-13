'use client';
import {t,useLanguage,languageLocale} from './locale';

import {characterName} from './characters';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import PhotoZoom from './photo-zoom';
import PhotoMemo from './photo-memo';
import {Star,Share2,X,ArrowUpRight,ChevronLeft,ChevronRight,Maximize2,Minimize2} from 'lucide-react';
type Photo={character?:string;id:string;image_url:string;source:string;source_kind:string;collected_at:string;imported:number;favorite:number};
type Props={onImageActivate?:()=>void;photo:Photo;number:string;index:number;z:number;saving:boolean;onClose:()=>void;onRaise:()=>void;onFavorite:()=>void;onShare:()=>void;onStep:(direction:number)=>void;canStep:boolean};
export default function PhotoWindow({onImageActivate,photo,number,index,z,saving,onClose,onRaise,onFavorite,onShare,onStep,canStep}:Props){
 useLanguage();
 const [position,setPosition]=useState({x:0,y:0}),[ready,setReady]=useState(false),[maximized,setMaximized]=useState(false),[natural,setNatural]=useState<{src:string;ratio:number}|null>(null),[size,setSize]=useState({width:500,height:600});
 const manual=useRef<{width:number;height:number}|null>(null),resizing=useRef<{side:'left'|'right';x:number;left:number;top:number;width:number;height:number}|null>(null),moved=useRef(false),frame=useRef<HTMLElement>(null),drag=useRef<{x:number;y:number;left:number;top:number}|null>(null);
 function bounded(x:number,y:number,width=frame.current?.offsetWidth||size.width,height=frame.current?.offsetHeight||size.height){return {x:Math.max(12,Math.min(x,innerWidth-width-12)),y:Math.max(12,Math.min(y,innerHeight-height-12))};}
 useEffect(()=>{
  let active=true;setReady(false);
  const image=new Image();
  image.onload=()=>{if(active)setNatural({src:photo.image_url,ratio:image.naturalWidth/image.naturalHeight||1});};
  image.onerror=()=>{if(active)setNatural({src:photo.image_url,ratio:1});};
  image.src=photo.image_url;
  return()=>{active=false;};
 },[photo.image_url]);
 useLayoutEffect(()=>{
  if(!frame.current||natural?.src!==photo.image_url)return;
  const chrome=Array.from(frame.current.querySelectorAll<HTMLElement>('.photo-titlebar,.window-caption,.zoom-controls,.window-photo-actions,.window-source-note,.photo-memo'));
  function fit(){
   if(maximized){setReady(true);return;}
   const viewportWidth=Math.max(160,innerWidth-24),minWidth=Math.min(420,viewportWidth);
   const maxWidth=manual.current||index===0?viewportWidth:Math.max(minWidth,Math.min(viewportWidth,innerWidth*.7));
   const maxHeight=Math.max(240,manual.current||index===0?innerHeight-32:Math.min(innerHeight-32,innerHeight*.76));
   const chromeHeight=chrome.reduce((sum,el)=>{const style=getComputedStyle(el);return sum+el.offsetHeight+(el.classList.contains('photo-memo')?(parseFloat(style.marginTop)||0)+(parseFloat(style.marginBottom)||0):0);},0)+3;
   const availableHeight=Math.max(80,maxHeight-chromeHeight);
   const width=Math.ceil(Math.min(maxWidth,Math.max(minWidth,manual.current?.width??(availableHeight*natural!.ratio+3))));
   const height=Math.ceil(Math.min(maxHeight,manual.current?.height??(chromeHeight+Math.min(availableHeight,(width-3)/natural!.ratio))));
   setSize(old=>old.width===width&&old.height===height?old:{width,height});
   const anchors=[[.5,.5],[.02,.04],[.98,.96],[.98,.04],[.02,.96],[.5,0],[.5,1],[0,.5],[1,.5],[.27,.25],[.73,.75]];
   const [ax,ay]=anchors[index%anchors.length];
   setPosition(old=>moved.current?bounded(old.x,old.y,width,height):bounded(12+Math.max(0,innerWidth-width-24)*ax,12+Math.max(0,innerHeight-height-24)*ay,width,height));
   setReady(true);
  }
  fit();const observer=new ResizeObserver(fit);chrome.forEach(el=>observer.observe(el));window.addEventListener('resize',fit);
  return()=>{observer.disconnect();window.removeEventListener('resize',fit);};
 },[natural,photo.image_url,maximized,index]);
 useEffect(()=>{if(ready)frame.current?.querySelector<HTMLElement>('.photo-titlebar')?.focus();},[ready]);
 function resizeWidth(side:'left'|'right',delta:number,start:{left:number;top:number;width:number;height:number}){
  const minWidth=Math.min(420,innerWidth-24),right=start.left+start.width;
  const width=side==='right'?Math.max(minWidth,Math.min(start.width+delta,innerWidth-start.left-12)):Math.max(minWidth,Math.min(start.width-delta,right-12));
  const left=side==='right'?start.left:right-width;
  manual.current={width,height:start.height};moved.current=true;
  setSize({width,height:start.height});setPosition({x:left,y:start.top});
 }
 function currentBox(){const rect=frame.current!.getBoundingClientRect();return {left:rect.left,top:rect.top,width:rect.width,height:rect.height};}
 const date=new Intl.DateTimeFormat(languageLocale(),{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric'}).format(new Date(photo.collected_at));
 return <section ref={frame} className={'photo-window '+(maximized?'window-maximized':'')} role="dialog" aria-modal="false" aria-label={characterName(photo.character)+' #'+number+t(" 사진 창")} style={{left:position.x,top:position.y,width:maximized?undefined:size.width,height:maximized?undefined:size.height,zIndex:z,visibility:ready&&natural?.src===photo.image_url?'visible':'hidden'}} onPointerDownCapture={onRaise} onFocusCapture={onRaise}>
  <header className="photo-titlebar" tabIndex={0} aria-label={characterName(photo.character)+' #'+number+t(" 창 제목 표시줄, 방향키로 이동")} onKeyDown={e=>{const dirs:Record<string,number[]>={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};if(e.target===e.currentTarget&&dirs[e.key]&&!maximized){e.preventDefault();const [x,y]=dirs[e.key];moved.current=true;setPosition(p=>bounded(p.x+x,p.y+y));}}} onPointerDown={e=>{if(maximized||(e.target as HTMLElement).closest('button,a'))return;e.preventDefault();e.currentTarget.focus();moved.current=true;drag.current={x:e.clientX,y:e.clientY,left:position.x,top:position.y};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(drag.current){const d=drag.current;setPosition(bounded(d.left+e.clientX-d.x,d.top+e.clientY-d.y));}}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
   <button className="window-close" onClick={onClose} aria-label={characterName(photo.character)+' #'+number+t(" 창 닫기")}><X size={15}/></button><span>{characterName(photo.character)} #{number}<small>{t("나의 사진 서랍")}</small></span><div className="window-title-actions"><button onClick={()=>setMaximized(!maximized)} aria-label={maximized?t("창 크기 복원"):t("창 크게 보기")}>{maximized?<Minimize2 size={14}/>:<Maximize2 size={14}/>}</button><a href={photo.source} target="_blank" rel="noreferrer" title={t("원본 열기")}>{t("원본 열기")}<ArrowUpRight size={13}/></a></div>
  </header>
  <div className="window-caption"><span>{date} · {photo.imported?t("메모에서 온 친구"):t(photo.source_kind)+t("에서 만난 친구")}</span><div><button onClick={()=>onStep(-1)} disabled={!canStep} aria-label={t("이전 사진")}><ChevronLeft size={15}/></button><button onClick={()=>onStep(1)} disabled={!canStep} aria-label={t("다음 사진")}><ChevronRight size={15}/></button></div></div>
  {!maximized&&(['left','right'] as const).map(side=><div key={side} className={'window-resize-edge window-resize-'+side} role="separator" aria-orientation="vertical" aria-label={t("사진 창 ")+(side==='left'?t("왼쪽"):t("오른쪽"))+t(" 가로 크기 조절")} aria-valuemin={Math.min(420,innerWidth-24)} aria-valuemax={innerWidth-24} aria-valuenow={Math.round(size.width)} tabIndex={0} title={t("드래그하거나 ← → 키로 가로 크기 조절")}
   onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();e.currentTarget.focus();resizing.current={side,x:e.clientX,...currentBox()};e.currentTarget.setPointerCapture(e.pointerId);}}
   onPointerMove={e=>{const start=resizing.current;if(start)resizeWidth(start.side,e.clientX-start.x,start);}}
   onPointerUp={e=>{resizing.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
   onPointerCancel={()=>{resizing.current=null;}}
   onKeyDown={e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();resizeWidth(side,(e.key==='ArrowRight'?1:-1)*(e.shiftKey?60:20),currentBox());}}/>)}
  <div className="window-body"><PhotoZoom onActivate={onImageActivate} src={photo.image_url} alt={characterName(photo.character)+' #'+number+t(" 수집 사진")}/><div className="window-photo-actions"><button className={photo.favorite?'selected-fav':''} onClick={onFavorite} disabled={saving}><Star size={17} fill={photo.favorite?'currentColor':'none'}/>{photo.favorite?t("별표 한 순간"):t("별표 붙이기")}</button><button onClick={onShare}><Share2 size={16}/>{t("출처와 공유")}</button><a href={photo.source} target="_blank" rel="noreferrer">{t(photo.source_kind)} <ArrowUpRight size={13}/></a></div><PhotoMemo key={photo.id} id={photo.id}/><p className="window-source-note">{photo.source_kind==='Pinterest'?t("출처: Pinterest 핀 · 원저작자 정보는 핀 페이지에서 확인해 주세요."):photo.source_kind==='치이카와 공식 애니메이션'?t("출처: 치이카와 공식 애니메이션 캐릭터 일러스트."):photo.source_kind==='치이카와 공식 마켓'?t("출처: 치이카와 공식 마켓 · 원본 상품 페이지에서 확인해 주세요."):t("기존 기록의 이미지 파일 주소를 출처로 보존했어요.")}</p></div>
 </section>;
}
