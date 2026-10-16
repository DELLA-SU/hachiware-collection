import {useEffect,useRef,useState} from 'react';
import {BarChart3,X} from 'lucide-react';
import {analyticsPageSupported,googleAnalyticsConsent,googleConsentChangeEvent,setGoogleAnalyticsConsent,trackingDeclinedByBrowser} from './analytics';
import {t,useLanguage} from './locale';
import './google-analytics-consent.css';

export default function GoogleAnalyticsConsent(){
 useLanguage();
 const [open,setOpen]=useState(()=>analyticsPageSupported()&&googleAnalyticsConsent()===null&&!trackingDeclinedByBrowser());
 const [details,setDetails]=useState(false),footer=useRef<HTMLButtonElement>(null),panel=useRef<HTMLElement>(null);
 useEffect(()=>{const changed=()=>setOpen(false);window.addEventListener(googleConsentChangeEvent,changed);return()=>window.removeEventListener(googleConsentChangeEvent,changed);},[]);
 function close(){if(panel.current?.contains(document.activeElement))footer.current?.focus({preventScroll:true});setOpen(false);}
 function choose(granted:boolean){setGoogleAnalyticsConsent(granted);close();}
 if(!analyticsPageSupported())return null;
 return <><div className="google-statistics-footer"><button ref={footer} onClick={()=>{setDetails(false);setOpen(true);}}><BarChart3 size={13}/>{t('Google 통계 설정')}</button></div>{open&&<aside ref={panel} className="google-consent" aria-label={t('Google 방문 통계')}>
  <button className="google-consent-close" aria-label={t('통계 안내 닫기')} onClick={close}><X size={16}/></button>
  <p className="google-consent-summary">{t('서비스 개선을 위해 쿠키를 사용합니다.')}</p>
  {trackingDeclinedByBrowser()&&<p className="google-consent-private" role="status">{t('브라우저의 추적 거부 설정으로 통계 수집이 꺼져 있어요.')}</p>}
  <div className="google-consent-actions"><button onClick={()=>choose(true)} disabled={trackingDeclinedByBrowser()}>{t('동의')}</button><button onClick={()=>choose(false)}>{t('거절')}</button><button className="google-consent-more" aria-expanded={details} aria-controls="google-consent-details" onClick={()=>setDetails(!details)}>{t('자세히')}</button></div>
  {details&&<div id="google-consent-details" className="google-consent-details"><p>{t('Google 통계는 허용한 경우에만 분석용 쿠키를 사용해요.')}</p><p>{t('허용한 뒤부터 페이지 조회·기능 사용·유입 경로·기기 정보를 Google로 보내요. 광고 개인화는 사용하지 않아요. 거절해도 모든 기능을 이용할 수 있어요.')}</p><p>{t('사진·메모·드로잉·이름은 보내지 않아요.')}</p><p>{t('선택은 현재 브라우저에 기억하며, 페이지 아래 ‘Google 통계 설정’에서 언제든 바꿀 수 있어요. 거절하면 이후 GA4 전송을 중단하고 이 사이트의 분석 쿠키를 지워요.')}</p><p>{t('쿠키 없는 Umami 통계는 별도로 운영하며, 도감의 ‘방문 통계 설정’에서 끌 수 있어요.')}</p><a href="https://policies.google.com/technologies/partner-sites?hl=ko" target="_blank" rel="noreferrer">{t('Google의 데이터 사용 안내')} ↗</a></div>}
 </aside>}</>;
}
