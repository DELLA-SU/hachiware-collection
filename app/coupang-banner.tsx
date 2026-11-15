import {useEffect,useRef,useState} from 'react';
import {assetUrl} from './asset-url';
import {t,useLanguage} from './locale';
import {trackEvent} from './analytics';
import './coupang-banner.css';

// Exact iframe URLs issued by this account in Coupang Partners on 2026-11-14.
const banners={
 wide:{id:1050181,width:728,height:140,src:'https://ads-partners.coupang.com/widgets.html?id=1050181&template=carousel&trackingCode=AF9897686&subId=&width=728&height=140&tsource='},
 compact:{id:1050183,width:320,height:140,src:'https://ads-partners.coupang.com/widgets.html?id=1050183&template=carousel&trackingCode=AF9897686&subId=&width=320&height=140&tsource='}
};
// Search-result link generated in the same publisher account on 2026-11-15.
const chiikawaSearch='https://link.coupang.com/a/iHapPIhGuG';

export default function CoupangBanner(){
 useLanguage();
 const viewport=useRef<HTMLDivElement>(null);
 const [availableWidth,setAvailableWidth]=useState(0);
 const [eligible,setEligible]=useState(false),[loaded,setLoaded]=useState(false);
 const reported=useRef(false);
 useEffect(()=>{
  const element=viewport.current;if(!element)return;
  const measure=()=>setAvailableWidth(element.clientWidth);
  measure();
  const observer=new ResizeObserver(measure);observer.observe(element);
  return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  const element=viewport.current;if(!element)return;
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setEligible(true);observer.disconnect();}},{rootMargin:'200px 0px'});observer.observe(element);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  const element=viewport.current;if(!element||!loaded||reported.current)return;
  let timer:ReturnType<typeof setTimeout>|undefined,visible=false;
  const stop=()=>{if(timer)clearTimeout(timer);timer=undefined;};
  const update=()=>{stop();if(visible&&!document.hidden&&!reported.current)timer=setTimeout(()=>{reported.current=true;trackEvent('coupang_banner_view');},1000);};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.5;update();},{threshold:[0,.5]});observer.observe(element);document.addEventListener('visibilitychange',update);
  return()=>{stop();observer.disconnect();document.removeEventListener('visibilitychange',update);};
 },[loaded]);
 const banner=availableWidth>=banners.wide.width?banners.wide:banners.compact;
 const scale=availableWidth?Math.min(1,availableWidth/banner.width):1;
 return <aside className="coupang-partners" aria-labelledby="coupang-partners-title">
  <header className="coupang-partners-heading">
   <h2 id="coupang-partners-title">{t('광고 · 쿠팡 파트너스')}</h2>
   <a href={assetUrl('privacy.html#coupang')}>{t('개인정보 안내')}</a>
  </header>
  <p className="coupang-partners-disclosure">{t('이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.')}</p>
  <div ref={viewport} className="coupang-partners-banner">
   {availableWidth>0&&eligible&&<div className="coupang-partners-frame" style={{width:banner.width*scale,height:banner.height*scale}}>
    <iframe key={banner.id} src={banner.src} title={t('쿠팡 완구·취미 광고')} width={banner.width} height={banner.height} frameBorder="0" scrolling="no" referrerPolicy="unsafe-url" loading="lazy" onLoad={()=>setLoaded(true)} style={{transform:`scale(${scale})`}}/>
   </div>}
  </div>
  <a className="coupang-partners-search" href={chiikawaSearch} target="_blank" rel="sponsored noopener" referrerPolicy="strict-origin-when-cross-origin" onClick={()=>trackEvent('coupang_search_click')}>{t('쿠팡에서 치이카와 상품 보기')} <span aria-hidden="true">↗</span></a>
 </aside>;
}
