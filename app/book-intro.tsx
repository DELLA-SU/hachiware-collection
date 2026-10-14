'use client';
import {t,useLanguage,languageLocale} from './locale';

import {useEffect,useRef,useState} from 'react';
import './book-intro.css';
import {assetUrl} from './asset-url';
import {playMotion} from './motion-sounds';

const seenKey='hachiware-book-intro-v1';
export default function BookIntro({latestImage}:{latestImage?:string}){
 useLanguage();
 const [visible,setVisible]=useState(true),[phase,setPhase]=useState('closed');
 const skip=useRef<HTMLButtonElement>(null);
 function finish(){void playMotion('paper');try{sessionStorage.setItem(seenKey,'seen');}catch{}setVisible(false);}
 useEffect(()=>{
  try{if(sessionStorage.getItem(seenKey)){setVisible(false);return;}}catch{}
  const open=setTimeout(()=>{void playMotion('paper');setPhase('opening');},1400);
  return()=>clearTimeout(open);
 },[]);
 useEffect(()=>{
  if(phase!=='opening')return;
  const fade=setTimeout(()=>setPhase('leaving'),2100);
  return()=>clearTimeout(fade);
 },[phase]);
 useEffect(()=>{
  if(phase!=='leaving')return;
  const end=setTimeout(finish,650);return()=>clearTimeout(end);
 },[phase]);
 useEffect(()=>{
  if(!visible)return;
  const previous=document.activeElement as HTMLElement|null;
  const oldOverflow=document.body.style.overflow;
  const siblings=Array.from(document.querySelector('.archive-shell')?.children||[]).filter(el=>!el.classList.contains('book-intro')) as HTMLElement[];
  const inert=siblings.map(el=>el.inert);
  siblings.forEach(el=>{el.inert=true;});document.body.style.overflow='hidden';skip.current?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();finish();}if(e.key==='Tab'){const buttons=document.querySelectorAll<HTMLButtonElement>('.book-intro button');const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  document.addEventListener('keydown',key);
  return()=>{document.body.style.overflow=oldOverflow;siblings.forEach((el,i)=>{el.inert=inert[i];});document.removeEventListener('keydown',key);if(previous&&previous!==document.body)previous.focus({preventScroll:true});};
 },[visible]);
 if(!visible)return null;
 return <div className={'book-intro '+phase} role="dialog" aria-modal="true" aria-label={t("치이카와 가챠가 펼쳐져요")}>
  <div className="intro-halo" aria-hidden="true"/>
  <div className="intro-book-scene">
   <div className="intro-book" aria-hidden="true">
    <div className="intro-page-stack"/>
    <div className="intro-page"><div className="intro-page-heading">{t("귀여움 보관함")}</div><div className="intro-page-photo"><img src={latestImage||assetUrl('/hachiware-favicon.png')} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=assetUrl('/hachiware-favicon.png');}} alt={t("최근에 만난 친구")}/></div><div className="intro-page-rule"/><div className="intro-index"><span>01</span> {t("오늘 만난 친구들")}<span>02</span> {t("별표 한 순간")}<span>03</span> {t("나만의 작은 기록")}</div><div className="intro-page-number">01</div></div>
    <div className="intro-cover"><div className="intro-cover-front"><span className="intro-edition">{t("나의 작은 백과사전")}</span><h2>{t("치이카와")}<br/><span>{t("가챠")}</span></h2><div className="intro-portrait"><img src={assetUrl('/hachiware-favicon.png')} alt=""/></div><div className="intro-cover-label">{t("좋아하는 마음을 한 장씩")}</div><div className="intro-spine-line"/></div><div className="intro-cover-back"><div className="intro-inside-frame"><img src={assetUrl('/hachiware-favicon.png')} alt=""/><span>{t("오늘도 만나서 반가워!")}</span><div className="intro-inside-heart">♡</div></div></div></div>
   </div>
  </div>
  <p className="intro-caption" aria-live="polite">{phase==='closed'?t("오늘의 귀여움을 펼쳐볼까요?"):t("한 장 한 장, 좋아하는 마음.")}</p>
  <button ref={skip} className="intro-skip" onClick={finish}>{t("바로 들어가기")}<span aria-hidden="true">↗</span></button>
 </div>;
}
