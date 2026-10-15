// Cookieless statistics: fixed events and public page addresses only.
export const websiteId='a78d3399-f325-45c2-b18e-c33d3934814a';
export const analyticsChangeEvent='hachiware-statistics-change';
const preferenceKey='hachiware-statistics-disabled';
const legacyConsentKey='hachiware-analytics-consent';
const base='/hachiware-collection/';
const titles:Record<string,string>={[base]:'치이카와 가챠',[base+'index.html']:'치이카와 가챠',[base+'certificates.html']:'치이카와 자격증 만들기',[base+'pajama.html']:'파자마 파티즈'};
const events=new Set(['photo_draw','open_random_photo','open_music','open_community','open_install_guide','download_desktop','export_records']);
type AnalyticsEvent='photo_draw'|'open_random_photo'|'open_music'|'open_community'|'open_install_guide'|'download_desktop'|'export_records';
type Platform='mac'|'windows_x64'|'windows_arm64';
type Payload=Record<string,unknown>;
type Pending={name:AnalyticsEvent;platform?:Platform};
type AnalyticsWindow=Window&{umami?:{track:(payload?:Payload)=>Promise<unknown>|void};hachiwareStatisticsBeforeSend?:(type:string,payload:Payload)=>Payload|false;'ga-disable-G-YXDXZV7X3Y'?:boolean};
let configured=false,pageSent=false,preferenceOverride:boolean|undefined;
const pending:Pending[]=[];
const live=()=>location.hostname==='della-su.github.io'&&Object.prototype.hasOwnProperty.call(titles,location.pathname);
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
function retireLegacyAnalytics(){
 (window as AnalyticsWindow)['ga-disable-G-YXDXZV7X3Y']=true;
 // Expire only this site's old GA cookies; collection and memo storage are untouched.
 for(const cookie of document.cookie.split(';')){const name=cookie.trim().split('=')[0];if(/^hachiware_ga(?:_|$)/.test(name))document.cookie=name+'=; Max-Age=0; Path='+base+'; SameSite=Lax; Secure';}
}
export function initAnalytics(){
 if(!live())return;
 retireLegacyAnalytics();
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
 if(!canTrack()||!events.has(name))return;
 initAnalytics();
 const event={name,...(name==='download_desktop'&&['mac','windows_x64','windows_arm64'].includes(platform||'')?{platform}:{})};
 if((window as AnalyticsWindow).umami)send(event);else if(pending.length<20)pending.push(event);
}
