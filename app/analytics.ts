// Only fixed event names and public page addresses enter Analytics.
export const measurementId='G-YXDXZV7X3Y';
const consentKey='hachiware-analytics-consent';
const disableKey=`ga-disable-${measurementId}` as const;
const cookiePath='/hachiware-collection/';
const pages=new Set([cookiePath,cookiePath+'index.html',cookiePath+'gacha-preview.html',cookiePath+'gacha-colors-preview.html',cookiePath+'strawberry-colors-preview.html']);
const events=new Set(['photo_draw','open_random_photo','open_music','open_community','open_install_guide','download_desktop','export_records']);
type AnalyticsEvent='photo_draw'|'open_random_photo'|'open_music'|'open_community'|'open_install_guide'|'download_desktop'|'export_records';
type Platform='mac'|'windows_x64'|'windows_arm64';
type AnalyticsWindow=Window&{dataLayer?:unknown[];gtag?:(...args:unknown[])=>void;[disableKey]?:boolean};
let configured=false,pageSent=false;
const live=()=>location.hostname==='della-su.github.io'&&pages.has(location.pathname);
export function analyticsConsent(): 'granted'|'denied'|null {
 try{const value=localStorage.getItem(consentKey);return value==='granted'||value==='denied'?value:null;}catch{return null;}
}
function pageFields(){
 let referrer='';try{referrer=new URL(document.referrer).origin;}catch{}
 return {page_location:location.origin+location.pathname,page_referrer:referrer,page_title:'하치와레 도감'};
}
export function initAnalytics(){
 if(!live()||analyticsConsent()!=='granted')return;
 const w=window as AnalyticsWindow;w[disableKey]=false;
 w.dataLayer ||= [];w.gtag ||= function(){w.dataLayer!.push(arguments);};
 if(!configured){
  configured=true;
  w.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  w.gtag('js',new Date());
  w.gtag('config',measurementId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,ads_data_redaction:true,cookie_prefix:'hachiware',cookie_path:cookiePath,cookie_domain:'none',cookie_expires:90*24*60*60,...pageFields()});
  const script=document.createElement('script');script.id='hachiware-analytics-tag';script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+measurementId;document.head.appendChild(script);
 }
 if(!pageSent){pageSent=true;w.gtag('event','page_view',{send_to:measurementId,...pageFields()});}
}
export function setAnalyticsConsent(value:'granted'|'denied'){
 try{localStorage.setItem(consentKey,value);}catch{return;}
 if(value==='granted')initAnalytics();
 else{
  (window as AnalyticsWindow)[disableKey]=true;
  // Leave other sites' cookies and the private collection untouched.
  for(const cookie of document.cookie.split(';')){
   const name=cookie.trim().split('=')[0];if(name.startsWith('hachiware_'))document.cookie=name+'=; Max-Age=0; Path='+cookiePath+'; SameSite=Lax; Secure';
  }
 }
}
export function trackEvent(name:AnalyticsEvent,platform?:Platform){
 if(!live()||analyticsConsent()!=='granted'||!events.has(name))return;
 initAnalytics();
 const data:Record<string,unknown>={send_to:measurementId,...pageFields()};
 if(name==='download_desktop'&&['mac','windows_x64','windows_arm64'].includes(platform||''))data.platform=platform;
 (window as AnalyticsWindow).gtag?.('event',name,data);
}
export function openAnalyticsSettings(){window.dispatchEvent(new Event('hachiware-analytics-settings'));}
