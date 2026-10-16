// Fixed events and sanitized public page addresses for both statistics providers.
export const websiteId='a78d3399-f325-45c2-b18e-c33d3934814a';
export const analyticsChangeEvent='hachiware-statistics-change';
export const googleConsentKey='hachiware-google-analytics-consent';
export const googleConsentChangeEvent='hachiware-google-consent-change';
const googleId='G-YXDXZV7X3Y';
const preferenceKey='hachiware-statistics-disabled';
const legacyConsentKey='hachiware-analytics-consent';
const base='/hachiware-collection/';
const titles:Record<string,string>={[base]:'치이카와 가챠',[base+'index.html']:'치이카와 가챠',[base+'certificates.html']:'치이카와 자격증 만들기',[base+'pajama.html']:'파자마 파티즈'};
const events=new Set(['photo_draw','open_random_photo','open_music','open_community','open_install_guide','download_desktop','export_records','pajama_dance_start','pajama_photo_add','certificate_select','certificate_photo_add','certificate_download']);
type AnalyticsEvent='photo_draw'|'open_random_photo'|'open_music'|'open_community'|'open_install_guide'|'download_desktop'|'export_records'|'pajama_dance_start'|'pajama_photo_add'|'certificate_select'|'certificate_photo_add'|'certificate_download';
type Platform='mac'|'windows_x64'|'windows_arm64';
type Payload=Record<string,unknown>;
type Pending={name:AnalyticsEvent;platform?:Platform};
type AnalyticsWindow=Window&{umami?:{track:(payload?:Payload)=>Promise<unknown>|void};hachiwareStatisticsBeforeSend?:(type:string,payload:Payload)=>Payload|false;dataLayer?:unknown[];gtag?:(...args:unknown[])=>void;'ga-disable-G-YXDXZV7X3Y'?:boolean};
let configured=false,pageSent=false,preferenceOverride:boolean|undefined;
const pending:Pending[]=[];
type GoogleConsent='granted'|'denied'|null;
let googleOverride:GoogleConsent|undefined,googleLoading=false,googleReady=false,googleConfigured=false,googlePageSent=false;
const googlePending:Pending[]=[];
const live=()=>location.hostname==='della-su.github.io'&&Object.prototype.hasOwnProperty.call(titles,location.pathname);
export const analyticsPageSupported=()=>Object.prototype.hasOwnProperty.call(titles,location.pathname);
export const trackingDeclinedByBrowser=()=>navigator.doNotTrack==='1';
export function googleAnalyticsConsent():GoogleConsent{
 if(googleOverride!==undefined)return googleOverride;
 try{const value=localStorage.getItem(googleConsentKey)??localStorage.getItem(legacyConsentKey);return value==='granted'||value==='denied'?value:null;}catch{return null;}
}
const canTrackGoogle=()=>live()&&googleAnalyticsConsent()==='granted'&&!trackingDeclinedByBrowser();
export function analyticsEnabled(){
 if(preferenceOverride!==undefined)return preferenceOverride;
 try{const value=localStorage.getItem(preferenceKey);if(value!==null)return value!=='true';return localStorage.getItem(legacyConsentKey)!=='denied';}catch{return true;}
}
const canTrack=()=>live()&&analyticsEnabled()&&navigator.doNotTrack!=='1';
function pageUrl(){
 const url=new URL(location.href),query=new URLSearchParams();
 for(const key of ['utm_source','utm_medium','utm_campaign','utm_content']){const value=url.searchParams.get(key);if(value&&/^[a-z0-9_-]{1,80}$/i.test(value))query.set(key,value);}
 const search=query.toString();return location.pathname+(search?'?'+search:'');
}
function pageFields():Payload{
 let referrer='';try{const url=new URL(document.referrer);if(url.protocol==='https:'||url.protocol==='http:')referrer=url.origin;}catch{}
 return {website:websiteId,hostname:location.hostname,url:pageUrl(),title:titles[location.pathname],referrer};
}
export function sanitizeAnalyticsPayload(type:string,payload:Payload):Payload|false{
 if(type!=='event'||!canTrack()||payload.website!==websiteId)return false;
 const name=payload.name;if(name!==undefined&&(typeof name!=='string'||!events.has(name)))return false;
 const safe=pageFields();
 if(typeof payload.language==='string'&&/^[a-z-]{1,35}$/i.test(payload.language))safe.language=payload.language;
 if(typeof payload.screen==='string'&&/^\d{1,5}x\d{1,5}$/.test(payload.screen))safe.screen=payload.screen;
 if(name!==undefined)safe.name=name;
 const data=payload.data as Payload|undefined;
 if(name==='download_desktop'&&data&&['mac','windows_x64','windows_arm64'].includes(String(data.platform)))safe.data={platform:data.platform};
 return safe;
}
function send(event?:Pending){
 if(!canTrack())return;
 const payload={...pageFields(),...(event?{name:event.name,...(event.platform?{data:{platform:event.platform}}:{})}:{})};
 try{const result=(window as AnalyticsWindow).umami?.track(payload);if(result)void result.catch(()=>{});}catch{}
}
function flush(){
 if(!canTrack()||!(window as AnalyticsWindow).umami)return;
 if(!pageSent){pageSent=true;send();}
 for(const event of pending.splice(0))send(event);
}
function clearGoogleCookies(){
 // These cookies are scoped to this project; collection and memo storage are untouched.
 for(const cookie of document.cookie.split(';')){const name=cookie.trim().split('=')[0];if(/^hachiware_ga(?:_|$)/.test(name))document.cookie=name+'=; Max-Age=0; Path='+base+'; SameSite=Lax; Secure';}
}
function googleFields(){const page=pageFields();return {page_location:location.origin+page.url,page_title:page.title,page_referrer:page.referrer,send_to:googleId};}
function googleCommand(...args:unknown[]){try{(window as AnalyticsWindow).gtag?.(...args);}catch{}}
function flushGoogle(){
 if(!canTrackGoogle()||!googleReady)return;
 if(!googleConfigured){
  googleConfigured=true;
  googleCommand('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  googleCommand('config',googleId,{...googleFields(),send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_prefix:'hachiware_ga',cookie_path:base,cookie_domain:'none',cookie_expires:15552000,cookie_flags:'SameSite=Lax;Secure'});
 }
 if(!googlePageSent){googlePageSent=true;googleCommand('event','page_view',googleFields());}
 for(const event of googlePending.splice(0))sendGoogle(event);
}
function initGoogleAnalytics(){
 const w=window as AnalyticsWindow;w['ga-disable-G-YXDXZV7X3Y']=!canTrackGoogle();
 if(!canTrackGoogle()){googlePending.length=0;clearGoogleCookies();return;}
 if(!googleLoading){
  googleLoading=true;
  w.dataLayer=w.dataLayer||[];
  w.gtag=w.gtag||function(){w.dataLayer!.push(arguments);};
  googleCommand('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  googleCommand('set','ads_data_redaction',true);
  googleCommand('js',new Date());
  const script=document.createElement('script');script.id='hachiware-google-analytics-tag';script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+googleId;
  script.onload=()=>{googleReady=true;flushGoogle();};script.onerror=()=>{googlePending.length=0;};document.head.appendChild(script);
 }
 flushGoogle();
}
function sendGoogle(event:Pending){
 if(!canTrackGoogle())return;
 googleCommand('event',event.name,{...googleFields(),...(event.platform?{platform:event.platform}:{})});
}
export function setGoogleAnalyticsConsent(granted:boolean){
 googleOverride=granted?'granted':'denied';try{localStorage.setItem(googleConsentKey,googleOverride);}catch{}
 if(live()){
  if(!granted){(window as AnalyticsWindow)['ga-disable-G-YXDXZV7X3Y']=true;googlePending.length=0;googleConfigured=false;if(googleReady)googleCommand('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});}
  initGoogleAnalytics();
 }
 window.dispatchEvent(new Event(googleConsentChangeEvent));
}
export function refreshGoogleAnalyticsConsent(){googleOverride=undefined;if(live()){if(!canTrackGoogle()){googleConfigured=false;if(googleReady){(window as AnalyticsWindow)['ga-disable-G-YXDXZV7X3Y']=true;googleCommand('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});}}initGoogleAnalytics();}window.dispatchEvent(new Event(googleConsentChangeEvent));}
export function initAnalytics(){
 if(!live())return;
 initGoogleAnalytics();
 if(!canTrack())return;
 if(!configured){
  configured=true;
  const w=window as AnalyticsWindow;w.hachiwareStatisticsBeforeSend=sanitizeAnalyticsPayload;
  const script=document.createElement('script');script.id='hachiware-statistics-tag';script.async=true;script.src='https://cloud.umami.is/script.js';
  script.dataset.websiteId=websiteId;script.dataset.autoTrack='false';script.dataset.domains='della-su.github.io';script.dataset.excludeSearch='true';script.dataset.excludeHash='true';script.dataset.doNotTrack='true';script.dataset.beforeSend='hachiwareStatisticsBeforeSend';
  script.onload=flush;script.onerror=()=>{pending.length=0;};document.head.appendChild(script);
 }
 flush();
}
export function setAnalyticsEnabled(enabled:boolean){
 preferenceOverride=enabled;try{localStorage.setItem(preferenceKey,enabled?'false':'true');}catch{}
 if(enabled)initAnalytics();else pending.length=0;
 window.dispatchEvent(new Event(analyticsChangeEvent));
}
export function refreshAnalyticsPreference(){preferenceOverride=undefined;if(analyticsEnabled())initAnalytics();else pending.length=0;}
export function trackEvent(name:AnalyticsEvent,platform?:Platform){
 if(!events.has(name))return;
 const event={name,...(name==='download_desktop'&&['mac','windows_x64','windows_arm64'].includes(platform||'')?{platform}:{})};
 if(canTrackGoogle()){initGoogleAnalytics();if(googleReady)sendGoogle(event);else if(googlePending.length<20)googlePending.push(event);}
 if(!canTrack())return;
 initAnalytics();
 if((window as AnalyticsWindow).umami)send(event);else if(pending.length<20)pending.push(event);
}
