import {useEffect,useRef,useState} from 'react';
import {assetUrl} from './asset-url';
import {t,useLanguage} from './locale';
import './coupang-banner.css';

// Exact iframe URLs issued by this account in Coupang Partners on 2026-11-14.
const banners={
 wide:{id:1050181,width:728,height:140,src:'https://ads-partners.coupang.com/widgets.html?id=1050181&template=carousel&trackingCode=AF9897686&subId=&width=728&height=140&tsource='},
 compact:{id:1050183,width:320,height:140,src:'https://ads-partners.coupang.com/widgets.html?id=1050183&template=carousel&trackingCode=AF9897686&subId=&width=320&height=140&tsource='}
};

export default function CoupangBanner(){
 useLanguage();
 const viewport=useRef<HTMLDivElement>(null);
 const [availableWidth,setAvailableWidth]=useState(0);
 useEffect(()=>{
  const element=viewport.current;if(!element)return;
  const measure=()=>setAvailableWidth(element.clientWidth);
  measure();
  const observer=new ResizeObserver(measure);observer.observe(element);
  return()=>observer.disconnect();
 },[]);
 const banner=availableWidth>=banners.wide.width?banners.wide:banners.compact;
 const scale=availableWidth?Math.min(1,availableWidth/banner.width):1;
 return <aside className="coupang-partners" aria-labelledby="coupang-partners-title">
  <header className="coupang-partners-heading">
   <h2 id="coupang-partners-title">{t('광고 · 쿠팡 파트너스')}</h2>
   <a href={assetUrl('privacy.html#coupang')}>{t('개인정보 안내')}</a>
  </header>
  <p className="coupang-partners-disclosure">{t('이 배너는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.')}</p>
  <div ref={viewport} className="coupang-partners-banner">
   {availableWidth>0&&<div className="coupang-partners-frame" style={{width:banner.width*scale,height:banner.height*scale}}>
    <iframe key={banner.id} src={banner.src} title={t('쿠팡 완구·취미 광고')} width={banner.width} height={banner.height} frameBorder="0" scrolling="no" referrerPolicy="unsafe-url" loading="lazy" style={{transform:`scale(${scale})`}}/>
   </div>}
  </div>
 </aside>;
}
