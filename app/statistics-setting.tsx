import {useEffect,useState} from 'react';
import {BarChart3} from 'lucide-react';
import {analyticsChangeEvent,analyticsEnabled,googleAnalyticsConsent,googleConsentChangeEvent,setAnalyticsEnabled,setGoogleAnalyticsConsent,trackingDeclinedByBrowser} from './analytics';
import {t} from './locale';
export default function StatisticsSetting(){
 const [enabled,setEnabled]=useState(analyticsEnabled);
 const [google,setGoogle]=useState(googleAnalyticsConsent);
 useEffect(()=>{const changed=()=>setEnabled(analyticsEnabled()),googleChanged=()=>setGoogle(googleAnalyticsConsent());window.addEventListener(analyticsChangeEvent,changed);window.addEventListener(googleConsentChangeEvent,googleChanged);return()=>{window.removeEventListener(analyticsChangeEvent,changed);window.removeEventListener(googleConsentChangeEvent,googleChanged);};},[]);
 return <div className="settings-section"><h3><BarChart3 size={17}/>{t('방문 통계 설정')}</h3><div className="settings-sound"><p>{t('Umami로 쿠키 없이 방문 수와 기능 사용 횟수를 집계해요. 사진·메모·드로잉·검색 내용은 보내지 않아요.')}</p><button role="switch" aria-checked={enabled} aria-label={t('방문 통계 설정')} onClick={()=>setAnalyticsEnabled(!enabled)}><span>{enabled?'ON':'OFF'}</span><i/></button></div><small>{t('이 선택은 현재 브라우저에만 적용돼요. 브라우저의 추적 거부 설정도 존중해요.')}</small><div className="settings-google"><div><span>Google Analytics · {trackingDeclinedByBrowser()?t('추적 거부'):google==='granted'?t('허용됨'):google==='denied'?t('거절됨'):t('선택 전')}</span><p>{t('Google 통계는 허용한 경우에만 분석용 쿠키를 사용해요.')}</p></div><button disabled={trackingDeclinedByBrowser()} onClick={()=>setGoogleAnalyticsConsent(google!=='granted')}>{google==='granted'?t('거절하기'):t('허용하기')}</button></div></div>;
}
