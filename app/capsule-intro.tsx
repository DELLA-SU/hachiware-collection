import {useEffect,useRef,useState} from 'react';
import CapsuleScene from './capsule-scene';
import {t,useLanguage} from './locale';
import {playMotion} from './motion-sounds';
import './capsule-intro.css';

function shouldShow(){
 if(new URLSearchParams(location.hash.slice(1)).has('desktop_photo'))return false;
 return true;
}
export default function CapsuleIntro(){
 useLanguage();
 const [visible,setVisible]=useState(shouldShow),[open,setOpen]=useState(false),[leaving,setLeaving]=useState(false);
 const dialog=useRef<HTMLDivElement>(null),skip=useRef<HTMLButtonElement>(null);
 function enter(){if(leaving)return;void playMotion('switch');setLeaving(true);}
 function reveal(){if(open||leaving)return;void playMotion('reveal');setOpen(true);}
 useEffect(()=>{if(!visible||open||leaving)return;const timer=setTimeout(()=>setOpen(true),matchMedia('(prefers-reduced-motion: reduce)').matches?150:1200);return()=>clearTimeout(timer);},[visible,open,leaving]);
 useEffect(()=>{
  if(!visible||!open||leaving)return;
  // Let the three photos finish appearing, then continue straight into the collection.
  const timer=setTimeout(()=>setLeaving(true),matchMedia('(prefers-reduced-motion: reduce)').matches?1200:1750);
  return()=>clearTimeout(timer);
 },[visible,open,leaving]);
 useEffect(()=>{
  if(!leaving)return;
  const timer=setTimeout(()=>{
   const url=new URL(location.href);if(url.searchParams.get('welcome')==='1'){url.searchParams.delete('welcome');history.replaceState(null,'',url.pathname+url.search+url.hash);}
   setVisible(false);
  },matchMedia('(prefers-reduced-motion: reduce)').matches?150:650);
  return()=>clearTimeout(timer);
 },[leaving]);
 useEffect(()=>{
  if(open)dialog.current?.focus({preventScroll:true});
 },[open]);
 useEffect(()=>{
  if(!visible)return;
  const previous=document.activeElement as HTMLElement|null,oldOverflow=document.body.style.overflow;
  const siblings=[...(dialog.current?.parentElement?.children||[])].filter(el=>el!==dialog.current) as HTMLElement[],inert=siblings.map(el=>el.inert);
  siblings.forEach(el=>{el.inert=true;});document.body.style.overflow='hidden';skip.current?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setLeaving(true);}
   if(e.key==='Tab'){const buttons=[...dialog.current!.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')].filter(button=>button.tabIndex>=0),first=buttons[0],last=buttons.at(-1);if(!buttons.length){e.preventDefault();}else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  };
  document.addEventListener('keydown',key);
  return()=>{document.body.style.overflow=oldOverflow;siblings.forEach((el,i)=>{el.inert=inert[i];});document.removeEventListener('keydown',key);if(previous&&previous!==document.body)previous.focus({preventScroll:true});else document.querySelector<HTMLAnchorElement>('.index-brand a')?.focus({preventScroll:true});};
 },[visible]);
 if(!visible)return null;
 return <div ref={dialog} className={'capsule-intro'+(leaving?' leaving':'')} role="dialog" aria-modal="true" aria-label={t('치이카와 가챠')} tabIndex={-1}><CapsuleScene open={open} className="capsule-intro-scene" onOpen={reveal} showWelcome={false}/>{!open&&<button ref={skip} className="capsule-intro-skip" disabled={leaving} onClick={enter}>{t('바로 들어가기')}<span aria-hidden="true">↗</span></button>}</div>;
}
