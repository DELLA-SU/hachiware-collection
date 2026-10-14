'use client';
import {t,useLanguage,languageLocale} from './locale';

import {useEffect,useRef} from 'react';
import {X,ArrowUpRight,Music2} from 'lucide-react';
import './music-tv.css';
export default function MusicTV({onClose}:{onClose:()=>void}){
 useLanguage();
 const close=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLElement>(null);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
  const overlay=dialog.current?.parentElement;
  const siblings=Array.from(overlay?.parentElement?.children||[]).filter(el=>el!==overlay) as HTMLElement[];
  const inert=siblings.map(el=>el.inert);siblings.forEach(el=>{el.inert=true;});document.body.style.overflow='hidden';close.current?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const focusable=dialog.current?.querySelectorAll<HTMLElement>('button,a,iframe');if(!focusable?.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
  document.addEventListener('keydown',key);return()=>{siblings.forEach((el,i)=>{el.inert=inert[i];});document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus({preventScroll:true});};
 },[onClose]);
 return <div className="music-tv-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={dialog} className="music-tv" role="dialog" aria-modal="true" aria-labelledby="music-tv-title">
  <div className="music-tv-aerial" aria-hidden="true"><i/><i/></div>
  <header className="music-tv-header"><span className="music-tv-title" id="music-tv-title"><Music2 size={18}/>{t("하치와레 노래 TV")}</span><button ref={close} onClick={onClose} aria-label={t("TV 닫기")}><X size={20}/></button></header>
  <div className="music-tv-body"><div className="music-tv-screen"><iframe src="https://www.youtube-nocookie.com/embed/-zHG8-c1KY4?autoplay=1&rel=0&playsinline=1" title={t("하치와레 노래 유튜브 영상")} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div><div className="music-tv-dials" aria-hidden="true"><div className="music-tv-knob"/><div className="music-tv-knob small"/><div className="music-tv-speaker"/><span className="music-tv-on">ON AIR</span></div></div>
  <footer className="music-tv-footer"><span><i/>{t("치이들과 노래 들으러 왔어요 ♪")}</span><a href="https://www.youtube.com/watch?v=-zHG8-c1KY4" target="_blank" rel="noopener noreferrer">{t("YouTube에서 보기")}<ArrowUpRight size={14}/></a></footer><div className="music-tv-feet" aria-hidden="true"><i/><i/></div>
 </section></div>;
}
