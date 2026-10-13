import {useEffect,useState} from 'react';
import {analyticsConsent,initAnalytics,setAnalyticsConsent} from './analytics';
import './analytics-consent.css';
export default function AnalyticsConsent(){
 const [open,setOpen]=useState(()=>analyticsConsent()===null);
 useEffect(()=>{initAnalytics();const settings=()=>setOpen(true);const changed=(e:StorageEvent)=>{if(e.key==='hachiware-analytics-consent'||e.key===null){const value=analyticsConsent();if(value==='granted')initAnalytics();else setAnalyticsConsent('denied');setOpen(value===null);}};window.addEventListener('hachiware-analytics-settings',settings);window.addEventListener('storage',changed);return()=>{window.removeEventListener('hachiware-analytics-settings',settings);window.removeEventListener('storage',changed);};},[]);
 function choose(value:'granted'|'denied'){setAnalyticsConsent(value);setOpen(false);}
 if(!open)return null;
 return <aside className="analytics-choice" aria-label="방문 통계 설정"><strong>방문 통계에 참여할까요?</strong><p>허용하면 Google Analytics 쿠키로 방문과 버튼 사용 횟수를 알아봐요. 사진·메모·드로잉·검색 내용은 보내지 않아요. 선택은 ‘방문 통계 설정’에서 바꿀 수 있어요.</p><div><button onClick={()=>choose('denied')}>사용 안 함</button><button onClick={()=>choose('granted')}>통계 허용</button></div></aside>;
}
