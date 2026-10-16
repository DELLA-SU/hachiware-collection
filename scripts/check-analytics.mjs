import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync(new URL('../app/analytics.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function setup({host='della-su.github.io',path='/hachiware-collection/',consent=null,googleConsent=null,dnt='0',blocked=false}={}){
 const store=new Map([['private-record','keep me']]),scripts=[],cookies=[],sent=[],notifications=[];
 if(consent)store.set('hachiware-analytics-consent',consent);
 if(googleConsent)store.set('hachiware-google-analytics-consent',googleConsent);
 const document={referrer:'https://example.com/private?note=private#photo',head:{appendChild:s=>scripts.push(s)},createElement:()=>({dataset:{}})};
 Object.defineProperty(document,'cookie',{get:()=> 'hachiware_ga=123; hachiware_ga_YXDXZV7X3Y=789; unrelated_ga=456; hachiware_language=ko',set:value=>cookies.push(value)});
 const window={dispatchEvent:event=>notifications.push(event.type)},location={hostname:host,origin:'https://'+host,pathname:path,href:'https://'+host+path+'?memo=secret&utm_source=instagram&utm_campaign=launch#desktop_photo=secret'};
 const context={exports:{},window,document,navigator:{doNotTrack:dnt},localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return store.get(k)??null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');store.set(k,v);}},location,URL,URLSearchParams,Event,Date,Set};
 vm.runInNewContext(source,context);
 const api=context.exports;
 const ready=()=>{window.umami={track:payload=>{const clean=window.hachiwareStatisticsBeforeSend('event',payload);if(clean)sent.push(clean);return Promise.resolve();}};scripts.find(s=>s.id==='hachiware-statistics-tag')?.onload();};
 const googleReady=()=>scripts.find(s=>s.id==='hachiware-google-analytics-tag')?.onload();
 const googleCommands=()=>Array.from(window.dataLayer||[],args=>Array.from(args));
 return {api,window,store,scripts,cookies,sent,notifications,context,ready,googleReady,googleCommands};
}
const x=setup();x.api.initAnalytics();x.api.trackEvent('photo_draw');
assert.equal(x.scripts.length,1);assert.equal(x.sent.length,0);assert.equal(x.scripts[0].dataset.autoTrack,'false');assert.equal(x.scripts[0].dataset.beforeSend,'hachiwareStatisticsBeforeSend');assert.equal(x.scripts[0].dataset.websiteId,x.api.websiteId);assert.equal(x.scripts[0].src,'https://cloud.umami.is/script.js');
x.ready();assert.equal(x.sent.length,2);assert.equal(x.sent.filter(p=>!p.name).length,1);x.api.initAnalytics();assert.equal(x.sent.length,2);
x.api.trackEvent('download_desktop','windows_x64');x.api.trackEvent('private_photo_id','secret');x.api.trackEvent('download_desktop','secret');
for(const p of x.sent){assert.equal(p.url,'/hachiware-collection/?utm_source=instagram&utm_campaign=launch');assert.equal(p.referrer,'https://example.com');assert.equal(p.title,'치이카와 가챠');assert(!JSON.stringify(p).includes('secret'));assert(!JSON.stringify(p).includes('private'));assert(!Object.hasOwn(p,'id'));}
assert.equal(x.sent[2].data.platform,'windows_x64');assert(!Object.hasOwn(x.sent[3],'data'));
const dirty={website:x.api.websiteId,url:'secret',title:'private memo',id:'private-user',data:{memo:'private',photo:'secret'},name:'photo_draw',language:'ko-KR',screen:'390x844'};
const safe=x.api.sanitizeAnalyticsPayload('event',dirty);assert(!Object.hasOwn(safe,'data'));assert(!Object.hasOwn(safe,'id'));assert.equal(safe.language,'ko-KR');assert.equal(safe.screen,'390x844');assert.equal(x.api.sanitizeAnalyticsPayload('identify',dirty),false);assert.equal(x.api.sanitizeAnalyticsPayload('event',{...dirty,name:'secret'}),false);
const before=x.sent.length;x.api.setAnalyticsEnabled(false);x.api.trackEvent('photo_draw');assert.equal(x.sent.length,before);assert.equal(x.api.sanitizeAnalyticsPayload('event',dirty),false);x.api.setAnalyticsEnabled(true);assert.equal(x.sent.length,before);assert.equal(x.scripts.length,1);
assert(x.cookies.every(c=>/^hachiware_ga(?:_|=)/.test(c)&&c.includes('Max-Age=0')));assert.equal(x.store.get('private-record'),'keep me');assert.equal(x.window['ga-disable-G-YXDXZV7X3Y'],true);
const rejected=setup({consent:'denied'});rejected.api.initAnalytics();assert.equal(rejected.scripts.length,0);rejected.api.setAnalyticsEnabled(true);assert.equal(rejected.scripts.length,1);
const loading=setup();loading.api.initAnalytics();loading.api.trackEvent('photo_draw');loading.api.setAnalyticsEnabled(false);loading.ready();assert.equal(loading.sent.length,0);loading.api.setAnalyticsEnabled(true);assert.equal(loading.sent.length,1);
loading.store.set('hachiware-statistics-disabled','true');loading.api.refreshAnalyticsPreference();loading.api.trackEvent('photo_draw');assert.equal(loading.sent.length,1);
const blocked=setup({blocked:true});blocked.api.initAnalytics();blocked.api.setAnalyticsEnabled(false);assert.equal(blocked.api.analyticsEnabled(),false);blocked.ready();assert.equal(blocked.sent.length,0);
for(const options of [{host:'127.0.0.1'},{path:'/other-private-site/'},{path:'/hachiware-collection/__proto__'},{dnt:'1'}]){const s=setup(options);s.api.initAnalytics();s.api.trackEvent('photo_draw');assert.equal(s.scripts.length,0);}
for(const [page,names] of [['certificates.html',['certificate_select','certificate_photo_add','certificate_download']],['pajama.html',['pajama_dance_start','pajama_photo_add']]]){
 const path='/hachiware-collection/'+page,s=setup({path});s.api.initAnalytics();s.ready();assert.equal(s.sent.length,1);assert.equal(s.sent[0].url,path+'?utm_source=instagram&utm_campaign=launch');
 for(const name of names){s.api.trackEvent(name);const clean=s.api.sanitizeAnalyticsPayload('event',{...dirty,name});assert.equal(clean.name,name);assert(!Object.hasOwn(clean,'data'));assert(!Object.hasOwn(clean,'id'));assert.equal(clean.url,path+'?utm_source=instagram&utm_campaign=launch');}
 assert.deepEqual(s.sent.slice(1).map(p=>p.name),names);
 const count=s.sent.length;s.api.setAnalyticsEnabled(false);for(const name of names)s.api.trackEvent(name);assert.equal(s.sent.length,count);
}
const unavailable=setup();unavailable.api.initAnalytics();unavailable.scripts[0].onerror();unavailable.window.umami={track:()=>{throw Error('offline');}};assert.doesNotThrow(()=>unavailable.api.trackEvent('photo_draw'));
console.log('PASS: cookieless loading, one pageview, safe payloads, preserved opt-outs, cross-tab preferences, legacy cookie cleanup, local record isolation, all three pages and five studio events, DNT/development exclusion, and analytics failure isolation');

const ga=setup();ga.api.initAnalytics();ga.api.trackEvent('pajama_dance_start');assert.equal(ga.api.googleAnalyticsConsent(),null);assert(!ga.scripts.some(s=>s.id==='hachiware-google-analytics-tag'));assert.equal(ga.window.dataLayer,undefined);
ga.api.setGoogleAnalyticsConsent(true);assert.equal(ga.store.get('hachiware-google-analytics-consent'),'granted');assert.equal(ga.window['ga-disable-G-YXDXZV7X3Y'],false);assert.equal(ga.googleCommands().filter(c=>c[0]==='event').length,0);
ga.api.trackEvent('certificate_select');ga.googleReady();const commands=ga.googleCommands(),defaults=commands.find(c=>c[0]==='consent'&&c[1]==='default'),config=commands.find(c=>c[0]==='config');
assert.equal(defaults[2].analytics_storage,'denied');assert.equal(defaults[2].ad_storage,'denied');assert.equal(config[1],'G-YXDXZV7X3Y');assert.equal(config[2].send_page_view,false);assert.equal(config[2].allow_google_signals,false);assert.equal(config[2].allow_ad_personalization_signals,false);assert.equal(config[2].cookie_path,'/hachiware-collection/');assert.equal(config[2].cookie_domain,'none');
assert.deepEqual(commands.filter(c=>c[0]==='event').map(c=>c[1]),['page_view','certificate_select']);
ga.api.initAnalytics();ga.api.setGoogleAnalyticsConsent(true);assert.equal(ga.googleCommands().filter(c=>c[0]==='event'&&c[1]==='page_view').length,1);assert.equal(ga.scripts.filter(s=>s.id==='hachiware-google-analytics-tag').length,1);
ga.api.setAnalyticsEnabled(false);ga.api.trackEvent('download_desktop','windows_x64');assert.equal(ga.googleCommands().at(-1)[2].platform,'windows_x64');ga.api.trackEvent('private_photo_id','secret');assert(!ga.googleCommands().some(c=>c[1]==='private_photo_id'));
for(const c of ga.googleCommands().filter(c=>c[0]==='event'||c[0]==='config')){assert.equal(c[2].page_location,'https://della-su.github.io/hachiware-collection/?utm_source=instagram&utm_campaign=launch');assert.equal(c[2].page_referrer,'https://example.com');assert(!JSON.stringify(c).includes('secret'));assert(!JSON.stringify(c).includes('private'));}
const gaEventsBefore=ga.googleCommands().filter(c=>c[0]==='event').length;ga.api.setGoogleAnalyticsConsent(false);ga.api.trackEvent('photo_draw');assert.equal(ga.window['ga-disable-G-YXDXZV7X3Y'],true);assert.equal(ga.googleCommands().filter(c=>c[0]==='event').length,gaEventsBefore);assert.equal(ga.store.get('private-record'),'keep me');
const pendingGa=setup();pendingGa.api.setGoogleAnalyticsConsent(true);pendingGa.api.trackEvent('photo_draw');pendingGa.api.setGoogleAnalyticsConsent(false);pendingGa.googleReady();assert.equal(pendingGa.googleCommands().filter(c=>c[0]==='event'||c[0]==='config').length,0);pendingGa.api.setGoogleAnalyticsConsent(true);assert.deepEqual(pendingGa.googleCommands().filter(c=>c[0]==='event').map(c=>c[1]),['page_view']);
pendingGa.store.set('hachiware-google-analytics-consent','denied');pendingGa.api.refreshGoogleAnalyticsConsent();const pendingCount=pendingGa.googleCommands().length;pendingGa.api.trackEvent('photo_draw');assert.equal(pendingGa.googleCommands().length,pendingCount);assert.equal(pendingGa.window['ga-disable-G-YXDXZV7X3Y'],true);
for(const options of [{consent:'denied'},{googleConsent:'denied'},{googleConsent:'granted',dnt:'1'},{googleConsent:'granted',host:'localhost'},{googleConsent:'granted',path:'/other-site/'}]){const s=setup(options);s.api.initAnalytics();s.api.trackEvent('photo_draw');assert(!s.scripts.some(script=>script.id==='hachiware-google-analytics-tag'));}
for(const path of ['/hachiware-collection/','/hachiware-collection/certificates.html','/hachiware-collection/pajama.html']){const s=setup({path,googleConsent:'granted'});s.api.initAnalytics();s.googleReady();assert.equal(s.googleCommands().filter(c=>c[0]==='event'&&c[1]==='page_view').length,1);assert.equal(s.googleCommands().at(-1)[2].page_location,'https://della-su.github.io'+path+'?utm_source=instagram&utm_campaign=launch');}
const googleBlockedStore=setup({blocked:true});googleBlockedStore.api.setGoogleAnalyticsConsent(true);googleBlockedStore.googleReady();googleBlockedStore.api.setGoogleAnalyticsConsent(false);googleBlockedStore.api.trackEvent('photo_draw');assert.equal(googleBlockedStore.api.googleAnalyticsConsent(),'denied');assert.equal(googleBlockedStore.window['ga-disable-G-YXDXZV7X3Y'],true);
const googleFailure=setup();googleFailure.api.setGoogleAnalyticsConsent(true);googleFailure.scripts.find(s=>s.id==='hachiware-google-analytics-tag').onerror();assert.doesNotThrow(()=>googleFailure.api.trackEvent('photo_draw'));
console.log('PASS: GA4 basic consent blocks tags before opt-in, does not replay earlier actions, sends safe fields once, keeps ads denied, respects revocation across tabs and during load, preserves Umami independence and local records, and excludes DNT/local pages.');
