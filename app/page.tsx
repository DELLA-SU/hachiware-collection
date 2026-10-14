'use client';
import {t,useLanguage,languageLocale,countUnit} from './locale';

import {trackEvent} from './analytics';
import {characterName} from './characters';
import {useEffect,useState,useRef} from 'react';
import PhotoWindow from './photo-window';
import CapsuleIntro from './capsule-intro';
import SiteSettings from './site-settings';
import MusicTV from './music-tv';
import GachaHero,{craneDrawDuration} from './gacha-hero';
import {cranePalettes} from './gacha-colors';
import {readBannerPreference} from './banner-preferences';
import './letter-hero.css';
import catalog from '../lib/catalog.json';
import CollectionGuide from './collection-guide';
import InstallGuide from './install-guide';
import {photoMatchesSearch} from './collection-search';
import usagiVoices from './usagi-voices.json';
import {assetUrl} from './asset-url';
import {apiFetch} from '../lib/browser-api';
import {playMotion,setMotionSound,motionSoundEnabled} from './motion-sounds';
import {Star,ArrowUpRight,BookOpen,Sparkles,Upload,Download,Share2,X,ChevronDown,Heart,Search,RefreshCw,Check,ArrowRight,Menu,LayoutGrid,ChevronLeft,ChevronRight,CalendarDays,Music2,Volume2,VolumeX,BadgeCheck,Settings2,MoonStar} from 'lucide-react';
type Photo={character?:string;id:string;image_url:string;remote_url:string;source:string;source_kind:string;title:string;collected_at:string;met_at?:string;imported:number;favorite:number};
const day=(d:string)=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d));
const label=(d:string)=>new Intl.DateTimeFormat(languageLocale(),{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(new Date(d));
function BrandCharacter(){return <span className="brand-face brand-photo"><svg viewBox="45 25 680 555" aria-hidden="true"><image href={assetUrl('/brand-hachiware.png')} width="836" height="612"/></svg></span>}
export default function Home(){
 const language=useLanguage();
 useEffect(()=>{document.title=t("치이카와 가챠");},[language]);
 const [photos,setPhotos]=useState<Photo[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[view,setView]=useState('all'),[sort,setSort]=useState('new'),[filter,setFilter]=useState(''),[windows,setWindows]=useState<{key:string;id:string;z:number;placement:number}[]>([]),[notice,setNotice]=useState(''),[error,setError]=useState(''),[newId,setNewId]=useState(''),[about,setAbout]=useState(false),[saving,setSaving]=useState(''),[query,setQuery]=useState(''),[arrangement,setArrangement]=useState('desk'),[menuOpen,setMenuOpen]=useState(false),[removed,setRemoved]=useState<Photo|null>(null),[musicOpen,setMusicOpen]=useState(false);
 const [installOpen,setInstallOpen]=useState(false),[settingsOpen,setSettingsOpen]=useState(false);
 const [banner,setBanner]=useState(readBannerPreference);
 const bannerVariant=banner.variant,craneColor=banner.color;
 const [importOpen,setImportOpen]=useState(false),[importText,setImportText]=useState('');
 const importRef=useRef<HTMLInputElement>(null);
 const [soundsOn,setSoundsOn]=useState(true);
 useEffect(()=>setSoundsOn(motionSoundEnabled()),[]);
 const pending=useRef<string|null>(null),closeRef=useRef<HTMLButtonElement>(null),windowZ=useRef(100),windowPlacement=useRef(0);
 const soundContext=useRef<AudioContext|null>(null),unaBuffer=useRef<Record<string,Promise<AudioBuffer>>>({}),unaSource=useRef<AudioBufferSourceNode|null>(null),voiceBag=useRef<string[]>([]),lastVoice=useRef(''),voiceRequest=useRef(0);
 useEffect(()=>()=>{soundContext.current?.close();},[]);
 async function playUna(){
  if(!soundsOn)return;
  const request=++voiceRequest.current;
  try{
   try{unaSource.current?.stop();}catch{}
   soundContext.current ||= new AudioContext();const ctx=soundContext.current;await ctx.resume();
   if(!voiceBag.current.length){voiceBag.current=[...usagiVoices];for(let i=voiceBag.current.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[voiceBag.current[i],voiceBag.current[j]]=[voiceBag.current[j],voiceBag.current[i]];}if(voiceBag.current.at(-1)===lastVoice.current)voiceBag.current.reverse();}
   const clip=voiceBag.current.pop()!;lastVoice.current=clip;
   unaBuffer.current[clip] ||= fetch(assetUrl(clip)).then(r=>{if(!r.ok)throw new Error('voice unavailable');return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b));
   const buffer=await unaBuffer.current[clip];if(request!==voiceRequest.current)return;
   const source=ctx.createBufferSource();source.buffer=buffer;source.connect(ctx.destination);unaSource.current=source;source.start();
  }catch{if(request!==voiceRequest.current)return;unaBuffer.current={};setNotice('소리를 재생하지 못했어요. 기기의 소리 설정을 확인해 주세요.');}
 }

 function openPhoto(p:Photo){if(p.character==='usagi')void playUna();else void playMotion('reveal');const z=++windowZ.current,placement=windowPlacement.current++;setWindows(a=>a.some(w=>w.id===p.id)?a.map(w=>w.id===p.id?{...w,z}:w):[...a,{key:crypto.randomUUID(),id:p.id,z,placement}]);}
 function raiseWindow(key:string){const z=++windowZ.current;setWindows(a=>a.map(w=>w.key===key?{...w,z}:w));}
 function closeWindow(key:string){void playMotion('paper');setWindows(a=>a.filter(w=>w.key!==key));}
 useEffect(()=>{if(about||musicOpen||settingsOpen||installOpen)return;const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')setWindows(a=>{const top=[...a].sort((x,y)=>y.z-x.z)[0];return top?a.filter(w=>w.key!==top.key):a;});};window.addEventListener('keydown',esc);return()=>window.removeEventListener('keydown',esc);},[about,musicOpen,settingsOpen,installOpen]);
 async function load(){setLoading(true);try{const r=await apiFetch('/api/collection',{cache:'no-store'}),j:any=await r.json();if(!r.ok)throw new Error(j.error);setPhotos(j.photos);setError('');}catch(e:any){setError(e.message||t("도감을 불러오지 못했어요."));}finally{setLoading(false);}}
 useEffect(()=>{load();const changed=(e:StorageEvent)=>{if(e.key==='hachiware-records-updated')void load();if(e.key==='hachiware-gacha-variant'){const n=Number(e.newValue);setBanner(b=>({...b,variant:n>=1&&n<=5?n:1}));}if(e.key==='hachiware-crane-color'){const n=Number(e.newValue);setBanner(b=>({...b,color:n>=0&&n<=cranePalettes.length?n:12}));}};window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);},[]);
 const desktopRequest=useRef('');
 useEffect(()=>{
  if(loading)return;
  const receive=async()=>{
   const params=new URLSearchParams(location.hash.slice(1)),id=params.get('desktop_photo'),request=params.get('request');
   if(!id||!request||desktopRequest.current===request)return;
   desktopRequest.current=request;
   try{
    const r=await apiFetch('/api/desktop-photo',{method:'POST',body:JSON.stringify({id,request_id:request})}),j:any=await r.json();
    if(!r.ok)throw new Error(j.error);
    history.replaceState(null,'',location.pathname+location.search);
    await load();setNewId(j.photo.id);setView('all');setFilter('');setQuery('');setSort('new');
    setNotice(j.existing?t("바탕화면에서 다시 만난 사진을 최근 목록에 올렸어요."):t("바탕화면에서 만난 사진을 도감에 담았어요."));
   }catch(e:any){desktopRequest.current='';setError(e.message||t("바탕화면 사진을 저장하지 못했어요."));}
  };
  void receive();window.addEventListener('hashchange',receive);return()=>window.removeEventListener('hashchange',receive);
 },[loading]);

 useEffect(()=>{if(!removed)return;const timer=setTimeout(()=>setRemoved(null),8000);return()=>clearTimeout(timer);},[removed]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(t);},[notice]);
 useEffect(()=>{if(!about)return;closeRef.current?.focus();const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){setAbout(false);}if(e.key==='Tab'){const dialog=document.querySelector('.about-modal');const els=Array.from(dialog?.querySelectorAll<HTMLElement>('button,a,input,select')||[]);if(els.length){const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}};document.addEventListener('keydown',onKey);const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',onKey);document.body.style.overflow=old;};},[about]);
 async function collect(){if(busy)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const revealReady=bannerVariant===1?new Promise<void>(resolve=>setTimeout(resolve,reduced?150:craneDrawDuration)):Promise.resolve();try{soundContext.current ||= new AudioContext();void soundContext.current.resume();}catch{}setBusy(true);setError('');pending.current ||= crypto.randomUUID();try{const r=await apiFetch('/api/collect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_id:pending.current})}),j:any=await r.json();if(!r.ok){pending.current=null;throw new Error(j.error);}pending.current=null;await revealReady;setPhotos(p=>[j.photo,...p.filter(x=>x.id!==j.photo.id)]);setNewId(j.photo.id);setView('all');setFilter('');setQuery('');setSort('new');openPhoto(j.photo);trackEvent('photo_draw');setNotice(j.existing?t("도감에 있는 친구를 다시 만났어요."):j.replayed?t("저장된 사진을 다시 확인했어요."):t("새로운 치이 한 장을 도감에 담았어요!"));}catch(e:any){setError(e.message||t("연결이 끊겼어요. 다시 누르면 같은 요청을 확인해요."));}finally{setBusy(false);}}
 async function removePhoto(p:Photo,restore=false){if(saving)return;void playMotion('paper');setSaving(p.id);try{const r=await apiFetch('/api/remove',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:p.id,restore})}),j:any=await r.json();if(!r.ok)throw new Error(j.error);if(restore){setPhotos(a=>[p,...a.filter(x=>x.id!==p.id)]);setRemoved(null);}else{setPhotos(a=>a.filter(x=>x.id!==p.id));setWindows(a=>a.filter(x=>x.id!==p.id));setRemoved(p);}}catch(e:any){setError(e.message||t("사진을 삭제하지 못했어요."));}finally{setSaving('');}}
 async function favorite(p:Photo){if(saving)return;if(!p.favorite)void playMotion('star');setSaving(p.id);try{const r=await apiFetch('/api/favorite',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:p.id,favorite:!p.favorite})}),j:any=await r.json();if(!r.ok)throw new Error(j.error);const update=(x:Photo)=>x.id===p.id?{...x,favorite:j.favorite}:x;setPhotos(a=>a.map(update));}catch(e:any){setError(e.message);}finally{setSaving('');}}
 async function share(p:Photo){const text=`${t("치이카와 가챠")} 🐾\n${characterName(p.character)} · ${label(p.collected_at)}\n${t("출처")}: ${p.source}`;try{if(navigator.share){await navigator.share({title:t("치이카와 가챠"),text,url:p.source});}else{await navigator.clipboard.writeText(text);setNotice('날짜와 출처 링크를 함께 복사했어요.');}}catch(e:any){if(e.name!=='AbortError')setError('공유하지 못했어요. 카드의 출처 링크를 이용해 주세요.');}}
 async function restoreFile(file:File){try{if(file.size>20_000_000)throw new Error(t("백업 파일이 너무 커요."));const data=JSON.parse(await file.text());const r=await apiFetch('/api/import',{method:'POST',body:JSON.stringify(data)}),j:any=await r.json();if(!r.ok)throw new Error(j.error);await load();setWindows([]);setView('all');setFilter('');setQuery('');setRemoved(null);setImportOpen(false);setImportText('');setNotice(`이전 기록을 합쳐 ${j.total}장을 불러왔어요. 별표와 메모도 함께 복원했어요.`);}catch(e:any){setError(e.message||t("기록을 불러오지 못했어요."));}finally{if(importRef.current)importRef.current.value='';}}
 async function backup(){try{const annotations:Record<string,unknown>={};await Promise.all(photos.map(async p=>{const r=await apiFetch('/api/annotation?id='+p.id);if(!r.ok)throw new Error(t("메모 백업을 준비하지 못했어요."));annotations[p.id]=await r.json();}));const blob=new Blob([JSON.stringify({version:2,exported_at:new Date().toISOString(),photos,annotations},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=t("치이카와-도감.json");a.click();URL.revokeObjectURL(u);trackEvent('export_records');setNotice('사진 기록과 별표, 메모, 드로잉을 내보냈어요.');}catch(e:any){setError(e.message||t("기록을 내보내지 못했어요."));}}

 const favorites=photos.filter(p=>p.favorite).length,days=new Set(photos.map(p=>day(p.collected_at))).size;
 const memory=photos.filter(p=>p.imported).length;
 const ordered=[...photos].sort((a,b)=>new Date(a.collected_at).getTime()-new Date(b.collected_at).getTime());
 const number=(p:Photo)=>String(ordered.findIndex(x=>x.id===p.id)+1).padStart(3,'0');
 const shown=photos.filter(p=>(view!=='favorites'||p.favorite)&&(view!=='memory'||p.imported)&&(view!=='new'||!p.imported)&&(!filter||day(p.collected_at)===filter)&&photoMatchesSearch(p,number(p),day(p.collected_at),query)).sort((a,b)=>sort==='new'?new Date(b.met_at||b.collected_at).getTime()-new Date(a.met_at||a.collected_at).getTime():new Date(a.collected_at).getTime()-new Date(b.collected_at).getTime());
 const dateIndex=photos.reduce((a,p)=>{const k=day(p.collected_at);a[k]=(a[k]||0)+1;return a;},{} as Record<string,number>);
 const dateKeys=Object.keys(dateIndex).sort().reverse();
 const viewTitle=view==='favorites'?t("별표 한 순간"):view==='memory'?t("메모에서 온 친구들"):view==='new'?t("웹에서 만난 친구들"):t("내 치이들 보관함");
 function chooseView(v:string){setView(v);setFilter('');setQuery('');setMenuOpen(false);}
 function surprise(){if(!shown.length)return;trackEvent('open_random_photo');openPhoto(shown[Math.floor(Math.random()*shown.length)]);}
 const hero=[...photos].sort((a,b)=>new Date(b.met_at||b.collected_at).getTime()-new Date(a.met_at||a.collected_at).getTime()).slice(0,3);
 function stepWindow(key:string,direction:number){setWindows(a=>a.map(w=>{if(w.key!==key||shown.length<2)return w;const i=shown.findIndex(p=>p.id===w.id);if(i<0)return w;return {...w,id:shown[(i+direction+shown.length)%shown.length].id};}));}
 return <div className="archive-shell"><CapsuleIntro/><aside className={'index-panel '+(menuOpen?'index-open':'')}><header className="index-brand"><a href={assetUrl('/')} className="brand"><BrandCharacter/><span>{t("치이카와 가챠")}</span></a><button className="mobile-menu" onClick={()=>setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={t("도감 색인 열기")}>{menuOpen?<X size={20}/>:<Menu size={20}/>}</button></header>
 <div className="index-content"><label className="index-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t("날짜, 출처, 사진 번호, 캐릭터 찾기")} aria-label={t("도감 검색")}/>{query&&<button onClick={()=>setQuery('')} aria-label={t("검색 지우기")}><X size={13}/></button>}</label>
 <nav className="index-section index-collection" aria-label={t("도감 색인")}><div className="index-section-title">{t("내 도감")}</div><button className={view==='all'?'selected':''} aria-current={view==='all'?'page':undefined} onClick={()=>chooseView('all')}><BookOpen size={16}/><span className="index-label">{t("전체 도감")}</span><span className="index-count">{photos.length}</span></button><button className={view==='favorites'?'selected':''} aria-current={view==='favorites'?'page':undefined} onClick={()=>chooseView('favorites')}><Star size={16}/><span className="index-label">{t("별표 한 순간")}</span><span className="index-count">{favorites}</span></button> <details className="dates-index"><summary className="index-section-title">{t("만난 날짜")}<span>{days}{countUnit(days,'일')}</span><ChevronDown size={14}/></summary><nav aria-label={t("날짜별 색인")}>{dateKeys.map(d=><button key={d} className={filter===d?'selected':''} onClick={()=>{setFilter(filter===d?'':d);setMenuOpen(false);}}><CalendarDays size={16}/><span className="index-label">{d.replaceAll('-','.')}</span><span className="index-count">{dateIndex[d]}</span></button>)}</nav></details></nav>
 <nav className="index-section index-play" aria-label={t("함께 즐기기")}><div className="index-section-title">{t("함께 즐기기")}</div><a className="community-link index-row" onClick={()=>trackEvent('open_community')} href="https://hachiware-favorite-gallery.nextrunners-1929.chatgpt.site"><Heart size={16}/><span className="index-label">{t("최애 한 장 공유하기")}</span><ArrowUpRight size={14}/></a><button className="index-row" onClick={()=>{void playMotion('switch');trackEvent('open_music');setMusicOpen(true);setMenuOpen(false);}} aria-haspopup="dialog"><Music2 size={16}/><span className="index-label">{t("하치와레 노래 TV")}</span><ArrowUpRight size={14}/></button><a className="index-row" href={assetUrl('certificates.html')}><BadgeCheck size={16}/><span className="index-label">{t("내 자격증 만들기")}</span><ArrowUpRight size={14}/></a><a className="index-row" href={assetUrl('pajama.html')}><MoonStar size={16}/><span className="index-label">{t("나도 파자마 파티즈 되기")}</span><ArrowUpRight size={14}/></a></nav>
 <div className="index-section index-app"><div className="index-section-title">{t("바탕화면 캐릭터")}</div><button className="desktop-download-trigger index-row" onClick={()=>{trackEvent('open_install_guide');setInstallOpen(true);setMenuOpen(false);}} aria-haspopup="dialog"><Download size={16}/><span className="index-label">{t("바탕화면 하치와레 캐릭터 받기")}</span><ArrowUpRight size={14}/></button></div>

 <input ref={importRef} type="file" accept="application/json,.json" aria-label={t("도감 백업 파일")} hidden onChange={e=>{const file=e.target.files?.[0];if(file)void restoreFile(file);}}/><div className="index-section archive-tools"><div className="index-section-title">{t("설정과 안내")}</div><button onClick={()=>{setSettingsOpen(true);setMenuOpen(false);}} aria-haspopup="dialog"><Settings2 size={16}/><span className="index-label">{t("효과음·언어 설정")}</span><ArrowUpRight size={14}/></button><button onClick={()=>{setAbout(true);setMenuOpen(false);}} aria-haspopup="dialog"><BookOpen size={16}/><span className="index-label">{t("도감 이용 안내")}</span><ArrowUpRight size={14}/></button></div>
</div></aside>
 {settingsOpen&&<SiteSettings soundsOn={soundsOn} onClose={()=>setSettingsOpen(false)} onSoundsChange={()=>{const enabled=!soundsOn;setSoundsOn(enabled);setMotionSound(enabled);if(enabled)void playMotion('star');else{++voiceRequest.current;try{unaSource.current?.stop();}catch{}}}}/>}
 <main className="scrap-desk"><GachaHero variant={bannerVariant} colorVariant={craneColor} onCollect={collect} onRandom={surprise} randomDisabled={!shown.length} busy={busy} loading={loading} result={newId&&catalog.find(p=>p.id===newId)?.draw_enabled!==false?photos.find(p=>p.id===newId)?.image_url:undefined}/>
 <section className="stats letter-stats" aria-label={t("수집 현황")}><div><BookOpen size={28}/><span>{t("모은 치이들")}</span><strong>{loading?'—':photos.length}<small>{countUnit(photos.length,'장')}</small></strong></div><div><Star size={28}/><span>{t("별표 한 순간")}</span><strong>{loading?'—':favorites}<small>{countUnit(favorites,'장')}</small></strong></div><div><Heart size={28}/><span>{t("함께한 날짜")}</span><strong>{loading?'—':days}<small>{countUnit(days,'일')}</small></strong></div></section>
<header className="desk-top"><div><h2>{viewTitle}<span>({shown.length})</span></h2></div></header>
 <div className="desk-toolbar"><div className="desk-controls"><label><span className="sr-only">{t("정렬")}</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="new">{t("최근 만난 순")}</option><option value="old">{t("처음 만난 순")}</option></select><ChevronDown size={13}/></label><div className="arrangement" aria-label={t("도감 배치")}><button className={arrangement==='desk'?'active':''} onClick={()=>setArrangement('desk')} aria-label={t("책상처럼 펼치기")} aria-pressed={arrangement==='desk'}><Sparkles size={15}/></button><button className={arrangement==='tidy'?'active':''} onClick={()=>setArrangement('tidy')} aria-label={t("가지런히 정돈하기")} aria-pressed={arrangement==='tidy'}><LayoutGrid size={15}/></button></div></div></div>
 {(filter||query)&&<div className="active-filter"><span>{filter?filter.replaceAll('-','.')+t("에 만난 친구들"):''}{filter&&query?' · ':''}{query?'“'+query+t("” 검색"):''}</span><button onClick={()=>{setFilter('');setQuery('');}}>{t("모두 보기")}<X size={13}/></button></div>}
 {error&&<div className="error" role="alert"><span>{t(error)}</span><button onClick={()=>{setError('');if(!photos.length)load();}}>{t("확인")}</button></div>}
 <section className={'desk-photos '+(arrangement==='tidy'?'tidy':'scattered')} aria-label={viewTitle}>
 {loading?<div className="empty"><span className="loading-face"><BrandCharacter/></span><h3>{t("도감 펼치는 중…")}</h3></div>:!shown.length?<div className="empty"><Star size={32}/><h3>{query||filter?t("찾는 치이가 아직 없어요."):view==='favorites'?t("아직 별표 한 순간이 없어요."):t("첫 치이를 만나볼까요?")}</h3><p>{view==='favorites'?t("사진 옆의 별을 누르면 이 서랍에 모여요."):t("검색을 바꾸거나 ‘치이카와 뽑기’로 한 장을 담아보세요.")}</p></div>:shown.map((p,i)=><article className={'scrap-card scrap-'+(i%8)+' '+(newId===p.id?'just-added':'')} key={p.id}><span className="card-tape" aria-hidden="true"/><button className="card-remove" onClick={()=>removePhoto(p)} disabled={saving===p.id} aria-label={characterName(p.character)+' #'+number(p)+t(" 컬렉션에서 삭제")}><X size={14}/></button><button className="photo-open" onClick={()=>openPhoto(p)} aria-label={characterName(p.character)+' #'+number(p)+t(" 사진 크게 보기")}><img src={p.image_url} alt={t("수집한 먼작귀 사진")} loading={i<8?'eager':'lazy'}/>{newId===p.id&&<span className="new-badge">{t("방금 만났어요")}</span>}<span className="zoom-hint">{t("펼쳐 보기")}<ArrowUpRight size={13}/></span></button><div className="card-meta"><div><small>{day(p.collected_at).replaceAll('-','.')}</small><h3>{characterName(p.character)} #{number(p)}</h3></div><button className={'star '+(p.favorite?'is-favorite':'')} onClick={()=>favorite(p)} aria-label={p.favorite?t("즐겨찾기 해제"):t("즐겨찾기에 추가")} aria-pressed={!!p.favorite} disabled={saving===p.id}><Star size={20} fill={p.favorite?'currentColor':'none'}/></button></div><div className="card-bottom"><a href={p.source} target="_blank" rel="noreferrer">{t(p.source_kind)}<ArrowUpRight size={12}/></a><button onClick={()=>share(p)} aria-label={t("출처와 함께 공유")}><Share2 size={14}/></button></div></article>)}
 </section></main>
 {removed&&<div className="toast undo-toast" role="status"><span>{t("사진을 도감에서 지웠어요.")}</span><button onClick={()=>removePhoto(removed,true)} disabled={!!saving}>{t("실행 취소")}</button><button className="undo-toast-close" aria-label={t("삭제 알림 닫기")} onClick={()=>setRemoved(null)}><X size={15}/></button></div>}
 {!removed&&notice&&<div className="toast" role="status"><Check size={18}/>{t(notice)}</div>}
 {windows.map((w,index)=>{const photo=photos.find(p=>p.id===w.id);return photo?<PhotoWindow key={w.key} photo={photo} onImageActivate={photo.character==='usagi'?()=>{void playUna();}:undefined} number={number(photo)} index={w.placement} z={w.z} saving={saving===photo.id} onRaise={()=>raiseWindow(w.key)} onClose={()=>closeWindow(w.key)} onFavorite={()=>favorite(photo)} onShare={()=>share(photo)} onStep={d=>stepWindow(w.key,d)} canStep={shown.length>1&&shown.some(p=>p.id===photo.id)}/>:null;})}
 {musicOpen&&<MusicTV onClose={()=>{void playMotion('switch');setMusicOpen(false);}}/>}
 {installOpen&&<InstallGuide onClose={()=>setInstallOpen(false)}/>}
 {importOpen&&<div className="overlay"><section className="modal about-modal" role="dialog" aria-modal="true" aria-label={t("기록 불러오기")}><button className="close" onClick={()=>setImportOpen(false)} aria-label={t("불러오기 닫기")}><X size={22}/></button><h2>{t("이전 기록 불러오기")}</h2><p>{t("현재 사진과 별표, 메모를 유지하며")}<br/>{t("백업한 기록을 합쳐요.")}</p><button className="about-done" onClick={()=>importRef.current?.click()}>{t("백업 파일 선택")}</button><p>{t("또는 백업 파일의 내용을 붙여넣어 주세요.")}</p><textarea aria-label={t("백업 내용")} value={importText} onChange={e=>setImportText(e.target.value)} style={{width:'100%',height:140,border:'1px solid #b7b5a2',borderRadius:12,padding:12}}/><button className="about-done" disabled={!importText.trim()} onClick={()=>void restoreFile(new File([importText],'backup.json',{type:'application/json'}))}>{t("기록 합쳐 불러오기")}</button></section></div>}
 {about&&<div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setAbout(false);}}><section className="modal about-modal guide-modal" role="dialog" aria-modal="true" aria-label={t("도감 이야기")}><button ref={closeRef} className="close" onClick={()=>setAbout(false)} aria-label={t("닫기")}><X size={22}/></button><CollectionGuide brand={<BrandCharacter/>} onDone={()=>setAbout(false)}/></section></div>}
 </div>;
}
