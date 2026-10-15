import {useEffect,useState} from 'react';
import {BarChart3} from 'lucide-react';
import {analyticsChangeEvent,analyticsEnabled,setAnalyticsEnabled} from './analytics';
import {t} from './locale';
export default function StatisticsSetting(){
 const [enabled,setEnabled]=useState(analyticsEnabled);
 useEffect(()=>{const changed=()=>setEnabled(analyticsEnabled());window.addEventListener(analyticsChangeEvent,changed);return()=>window.removeEventListener(analyticsChangeEvent,changed);},[]);
 return <div className="settings-section"><h3><BarChart3 size={17}/>{t('방문 통계 설정')}</h3><div className="settings-sound"><p>{t('Umami로 쿠키 없이 방문 수와 기능 사용 횟수를 집계해요. 사진·메모·드로잉·검색 내용은 보내지 않아요.')}</p><button role="switch" aria-checked={enabled} aria-label={t('방문 통계 설정')} onClick={()=>setAnalyticsEnabled(!enabled)}><span>{enabled?'ON':'OFF'}</span><i/></button></div><small>{t('이 선택은 현재 브라우저에만 적용돼요. 브라우저의 추적 거부 설정도 존중해요.')}</small></div>;
}
