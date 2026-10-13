import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync(new URL('../app/analytics.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function setup(host='della-su.github.io'){
 const store=new Map([['private-record','keep me']]),scripts=[],cookies=[];
 const document={referrer:'https://example.com/private?note=private#photo',head:{appendChild:s=>scripts.push(s)},createElement:()=>({})};
 Object.defineProperty(document,'cookie',{get:()=> 'hachiware_ga=123; unrelated_ga=456',set:value=>cookies.push(value)});
 const window={},context={exports:{},window,document,localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},location:{hostname:host,origin:'https://'+host,pathname:'/hachiware-collection/',hash:'#desktop_photo=secret',search:'?memo=secret'},URL,Event,Date,Set};
 vm.runInNewContext(source,context);
 return {api:context.exports,window,store,scripts,cookies,context,queue:()=>Array.from(window.dataLayer||[],a=>Array.from(a))};
}
const x=setup();x.api.initAnalytics();x.api.trackEvent('photo_draw');assert.equal(x.scripts.length,0);assert.equal(x.queue().length,0);
x.api.setAnalyticsConsent('denied');x.api.trackEvent('photo_draw');assert.equal(x.scripts.length,0);
x.api.setAnalyticsConsent('granted');x.api.initAnalytics();assert.equal(x.scripts.length,1);assert.equal(x.queue().filter(a=>a[0]==='event'&&a[1]==='page_view').length,1);
const config=x.queue().find(a=>a[0]==='config')[2];assert.equal(config.allow_google_signals,false);assert.equal(config.send_page_view,false);
x.api.trackEvent('download_desktop','windows_x64');x.api.trackEvent('private_photo_id','secret');x.api.trackEvent('download_desktop','secret');
for(const args of x.queue().filter(a=>a[0]==='event')){
 assert.equal(args[2].page_location,'https://della-su.github.io/hachiware-collection/');assert.equal(args[2].page_referrer,'https://example.com');assert(!JSON.stringify(args).includes('secret'));assert(!JSON.stringify(args).includes('private'));
}
const before=x.queue().length;x.api.setAnalyticsConsent('denied');x.api.trackEvent('photo_draw');assert.equal(x.queue().length,before);assert.equal(x.window['ga-disable-'+x.api.measurementId],true);assert(x.cookies.every(c=>c.startsWith('hachiware_')));assert.equal(x.store.get('private-record'),'keep me');
x.api.setAnalyticsConsent('granted');assert.equal(x.scripts.length,1);assert.equal(x.queue().filter(a=>a[1]==='page_view').length,1);
const dev=setup('127.0.0.1');dev.api.setAnalyticsConsent('granted');dev.api.trackEvent('photo_draw');assert.equal(dev.scripts.length,0);
const privatePath=setup();privatePath.context.location.pathname='/other-private-site/';privatePath.api.setAnalyticsConsent('granted');assert.equal(privatePath.scripts.length,0);
console.log('PASS: consent gating, safe URL/event payloads, no duplicate page view, withdrawal, cookie isolation, and development exclusion');
