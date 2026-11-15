import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Folder,Pause,Play} from 'lucide-react';
import {assetUrl} from './asset-url';
import {trackEvent} from './analytics';
import {t,useLanguage} from './locale';
import './desktop-invite.css';

export default function DesktopInvite(){
 useLanguage();
 const scene=useRef<HTMLDivElement>(null),pet=useRef<HTMLButtonElement>(null);
 const viewed=useRef(false),dragged=useRef(false);
 const [paused,setPaused]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{
  const area=scene.current,friend=pet.current;if(!area||!friend)return;
  let raf=0,last=0,time=0,visible=false,hover=false,angle=0;
  let x=0,y=0,drag:{id:number;dx:number;dy:number}|null=null;
  const limits=()=>({x:Math.max(0,area.clientWidth-friend.offsetWidth),y:Math.max(0,area.clientHeight-friend.offsetHeight-42)});
  const paint=()=>{friend.style.transform=`translate3d(${x}px,${y}px,0) rotate(${angle}deg)`;};
  const center=()=>{const b=limits();x=b.x/2;y=Math.max(56,b.y*.64);angle=0;paint();};
  const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;};
  const wake=()=>{if(!raf&&!paused&&visible&&!document.hidden)raf=requestAnimationFrame(step);};
  function step(now:number){raf=0;const dt=last?Math.min(.04,(now-last)/1000):1/30;last=now;time+=dt;
   if(!drag){const b=limits();x=b.x/2+Math.sin(time*.65)*5;y=Math.max(56,b.y*.64)-Math.sin(time*1.15)*9;angle=hover?Math.sin(time*3)*14:Math.sin(time*.7)*2;paint();}wake();
  }
  const down=(e:globalThis.PointerEvent)=>{if(e.button!==0)return;dragged.current=false;const box=area.getBoundingClientRect();drag={id:e.pointerId,dx:e.clientX-box.left-x,dy:e.clientY-box.top-y};friend.setPointerCapture(e.pointerId);};
  const move=(e:globalThis.PointerEvent)=>{if(!drag||drag.id!==e.pointerId)return;const box=area.getBoundingClientRect(),b=limits();const nextX=Math.max(0,Math.min(b.x,e.clientX-box.left-drag.dx)),nextY=Math.max(40,Math.min(b.y,e.clientY-box.top-drag.dy));if(Math.hypot(nextX-x,nextY-y)>3)dragged.current=true;x=nextX;y=nextY;angle=0;paint();};
  const up=(e:globalThis.PointerEvent)=>{if(drag?.id!==e.pointerId)return;drag=null;if(friend.hasPointerCapture(e.pointerId))friend.releasePointerCapture(e.pointerId);if(paused)center();};
  const enter=()=>{hover=true;};const leave=()=>{hover=false;};
  const visibility=()=>{if(document.hidden)stop();else wake();};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){if(entries[0].intersectionRatio>=.25&&!viewed.current){viewed.current=true;trackEvent('desktop_invite_view');}wake();}else stop();},{threshold:[0,.25]});observer.observe(area);
  const resize=new ResizeObserver(center);resize.observe(area);
  friend.addEventListener('pointerdown',down);friend.addEventListener('pointermove',move);friend.addEventListener('pointerup',up);friend.addEventListener('pointercancel',up);friend.addEventListener('pointerenter',enter);friend.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);center();
  return()=>{stop();observer.disconnect();resize.disconnect();friend.removeEventListener('pointerdown',down);friend.removeEventListener('pointermove',move);friend.removeEventListener('pointerup',up);friend.removeEventListener('pointercancel',up);friend.removeEventListener('pointerenter',enter);friend.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);};
 },[paused]);
 useEffect(()=>{const motion=matchMedia('(prefers-reduced-motion: reduce)');const changed=()=>setPaused(motion.matches);motion.addEventListener('change',changed);return()=>motion.removeEventListener('change',changed);},[]);
 return <section className="desktop-invite" aria-labelledby="desktop-invite-title">
  <div className="desktop-invite-copy"><span className="desktop-invite-eyebrow">A LITTLE FRIEND</span><h2 id="desktop-invite-title">{t('파티가 끝나도,')}<br/>{t('우리 계속 같이 있을래?')}</h2><p>{t('하치와레가 내 바탕화면에 놀러 와요.')}<br/>{t('둥실둥실 움직이는 작은 친구를 만나보세요.')}</p><a className="desktop-invite-cta" href={assetUrl('?skip_intro=1&desktop=1')} onClick={()=>trackEvent('pajama_to_main')}>{t('내 바탕화면 친구 만나기')}<ArrowUpRight size={17}/></a><small>{t('메인 도감에서 Mac · Windows 설치 방법을 확인해요.')}</small></div>
  <div className="desktop-invite-art"><div ref={scene} className="desktop-invite-scene"><div className="desktop-invite-menubar"><span>{t('치이 친구')}</span><button type="button" onClick={()=>setPaused(!paused)} aria-label={t(paused?'하치와레 움직임 재생':'하치와레 움직임 멈추기')} aria-pressed={paused}>{paused?<Play size={13}/>:<Pause size={13}/>}</button></div><span className="desktop-invite-speech">{t('나도 같이 갈래!')}</span><span className="desktop-invite-folder" aria-hidden="true"><Folder size={34} fill="currentColor"/><small>{t('좋아하는 것들')}</small></span><button ref={pet} className="desktop-invite-pet" type="button" title={t('하치와레를 잡고 움직여 보세요')} aria-label={t(paused?'하치와레 움직임 재생':'하치와레 움직임 멈추기')} onClick={()=>{if(!dragged.current)setPaused(!paused);dragged.current=false;}}><img src={assetUrl('desktop-guide/hachiware-preview.png')} width="480" height="480" alt="" loading="lazy" decoding="async" draggable="false"/></button><div className="desktop-invite-dock" aria-hidden="true"><i/><i/><i/><i/></div></div><p className="desktop-invite-caption">{t('내 바탕화면의 작은 친구')}</p></div>
 </section>;
}
