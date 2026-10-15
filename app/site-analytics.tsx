import {useEffect} from 'react';
import {analyticsChangeEvent,initAnalytics,refreshAnalyticsPreference} from './analytics';
export default function SiteAnalytics(){
 useEffect(()=>{initAnalytics();const changed=(event:StorageEvent)=>{if(event.key===null||event.key==='hachiware-statistics-disabled'||event.key==='hachiware-analytics-consent'){refreshAnalyticsPreference();window.dispatchEvent(new Event(analyticsChangeEvent));}};window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);},[]);
 return null;
}
