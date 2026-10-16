import {useEffect} from 'react';
import {analyticsChangeEvent,googleConsentKey,initAnalytics,refreshAnalyticsPreference,refreshGoogleAnalyticsConsent} from './analytics';
import GoogleAnalyticsConsent from './google-analytics-consent';
export default function SiteAnalytics(){
 useEffect(()=>{initAnalytics();const changed=(event:StorageEvent)=>{if(event.key===null||event.key===googleConsentKey||event.key==='hachiware-analytics-consent')refreshGoogleAnalyticsConsent();if(event.key===null||event.key==='hachiware-statistics-disabled'||event.key==='hachiware-analytics-consent'){refreshAnalyticsPreference();window.dispatchEvent(new Event(analyticsChangeEvent));}};window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);},[]);
 return <GoogleAnalyticsConsent/>;
}
