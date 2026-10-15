import {useEffect,useRef,useState,type CSSProperties,type PointerEvent} from 'react';
import {ArrowLeft,ImagePlus,Play,Pause,RotateCcw,Trash2,Volume2,VolumeX,MoonStar} from 'lucide-react';
import {assetUrl} from './asset-url';
import {t,useLanguage} from './locale';
import type {FaceOpening} from './pajama-tracking';
import danceTracks from '../lib/pajama-dance-tracks.json';
import './pajama-studio.css';

const members = [
  {name:'보라 파자마',color:'#d9cdec'},
  {name:'초록 파자마',color:'#dce9ac'},
  {name:'분홍 파자마',color:'#f3c2cf'},
  {name:'하양 파자마',color:'#fffdf7'},
];
type Portrait = {image:HTMLImageElement;url:string;zoom:number;x:number;y:number};
const danceVideo=assetUrl('pajama/dance-loop-v2.mp4');
const defaultFrames=danceTracks.frames as (FaceOpening|null)[][];
const emptyPhotos: (Portrait|null)[] = [null,null,null,null];

function paintPortrait(ctx:CanvasRenderingContext2D,photo:Portrait,face:FaceOpening,w:number,h:number){
  const x=face.x*w,y=face.y*h,fw=face.width*w,fh=face.height*h;
  const scale=Math.max(fw/photo.image.naturalWidth,fh/photo.image.naturalHeight)*photo.zoom;
  const pw=photo.image.naturalWidth*scale,ph=photo.image.naturalHeight*scale;
  ctx.save();ctx.beginPath();face.outline.forEach(([px,py],i)=>i?ctx.lineTo(px*w,py*h):ctx.moveTo(px*w,py*h));ctx.closePath();ctx.clip();
  ctx.drawImage(photo.image,x+(fw-pw)/2+(pw-fw)*photo.x/200,y+(fh-ph)/2+(ph-fh)*photo.y/200,pw,ph);ctx.restore();
}

export default function PajamaStudio(){
  const language=useLanguage();
  const [photos,setPhotos]=useState<(Portrait|null)[]>(emptyPhotos);
  const [selected,setSelected]=useState(0),[playing,setPlaying]=useState(false),[muted,setMuted]=useState(false),[ready,setReady]=useState(false),[starting,setStarting]=useState(false);
  const [duration,setDuration]=useState(0),[time,setTime]=useState(0),[error,setError]=useState(''),[movieFailed,setMovieFailed]=useState(false);
  const video=useRef<HTMLVideoElement>(null),audio=useRef<HTMLAudioElement>(null),canvas=useRef<HTMLCanvasElement>(null),photoInput=useRef<HTMLInputElement>(null);
  const photoState=useRef(photos),currentFaces=useRef<(FaceOpening|null)[]>([null,null,null,null]);
  const requests=useRef([0,0,0,0]),urls=useRef(new Set<string>()),paint=useRef<()=>void>(()=>{});
  useEffect(()=>{document.title=t('나도 파자마 파티즈 되기');},[language]);
  useEffect(()=>()=>{urls.current.forEach(url=>URL.revokeObjectURL(url));},[]);
  useEffect(()=>{photoState.current=photos;paint.current();},[photos]);
  function discard(url:string){URL.revokeObjectURL(url);urls.current.delete(url);}
  function resetPlayback(){if(video.current){video.current.pause();video.current.currentTime=0;}if(audio.current)audio.current.currentTime=0;paint.current();}
  async function uploadPhoto(file?:File){
    if(!file)return;const slot=selected,request=++requests.current[slot];
    if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>20_000_000){setError('20MB 이하의 JPG, PNG, WEBP 사진을 골라 주세요.');return;}
    const url=URL.createObjectURL(file);urls.current.add(url);const image=new Image();image.src=url;
    try{await image.decode();if(request!==requests.current[slot]){discard(url);return;}const old=photoState.current[slot];if(old)discard(old.url);setPhotos(values=>values.map((value,i)=>i===slot?{image,url,zoom:1,x:0,y:0}:value));setError('');}
    catch{discard(url);setError('사진을 열지 못했어요. 다른 사진을 골라 주세요.');}
    finally{if(photoInput.current)photoInput.current.value='';}
  }
  function updatePhoto(patch:Partial<Portrait>){setPhotos(values=>values.map((value,i)=>i===selected&&value?{...value,...patch}:value));}
  function removePhoto(){requests.current[selected]++;const old=photoState.current[selected];if(old)discard(old.url);setPhotos(values=>values.map((value,i)=>i===selected?null:value));}

  useEffect(()=>{
    const el=video.current,output=canvas.current;if(!el||!output)return;
    const ctx=output.getContext('2d');if(!ctx)return;
    let raf=0,active=true,lastReport=-1;
    const poster=new Image();poster.onload=()=>draw();poster.src=assetUrl('pajama/dance-poster-v2.jpg');
    function draw(){
      if(!active)return;const live=el!.readyState>=2&&!!el!.videoWidth;
      if(!live&&(!poster.complete||!poster.naturalWidth))return;
      const source=live?el!:poster,width=live?el!.videoWidth:poster.naturalWidth,height=live?el!.videoHeight:poster.naturalHeight;
      const w=Math.min(1280,width),h=Math.round(w*height/width);
      if(output!.width!==w||output!.height!==h){output!.width=w;output!.height=h;}
      const matches=defaultFrames[Math.min(defaultFrames.length-1,Math.floor((live?el!.currentTime:0)*danceTracks.fps))];
      currentFaces.current=matches;
      ctx!.drawImage(source,0,0,w,h);
      matches.forEach((face,i)=>{
        if(!face)return;const photo=photoState.current[i];if(photo)paintPortrait(ctx!,photo,face,w,h);
        if(el!.paused){ctx!.fillStyle='#fffdf7';ctx!.strokeStyle='#6e605b';ctx!.lineWidth=1.5;const cx=(face.x+face.width/2)*w,cy=face.y*h-13;ctx!.beginPath();ctx!.arc(cx,cy,12,0,Math.PI*2);ctx!.fill();ctx!.stroke();ctx!.fillStyle='#6e605b';ctx!.font='bold 13px sans-serif';ctx!.textAlign='center';ctx!.fillText(String(i+1),cx,cy+4);}
      });
      const report=Math.floor(el!.currentTime*4);if(el!.paused||report!==lastReport){lastReport=report;setTime(el!.currentTime);}
    }
    paint.current=draw;
    function tick(){draw();if(active)raf=requestAnimationFrame(tick);}
    function start(){cancelAnimationFrame(raf);tick();setPlaying(true);}
    function stop(){cancelAnimationFrame(raf);audio.current?.pause();setPlaying(false);draw();}
    function loaded(){setReady(true);setDuration(Number.isFinite(el!.duration)?el!.duration:0);draw();}
    function seek(){draw();}
    const loadEvents=['loadedmetadata','loadeddata','canplay','playing'];
    loadEvents.forEach(event=>el.addEventListener(event,loaded));el.addEventListener('play',start);el.addEventListener('pause',stop);el.addEventListener('ended',stop);el.addEventListener('seeked',seek);
    if(el.readyState>=1)loaded();
    return()=>{active=false;cancelAnimationFrame(raf);poster.onload=null;paint.current=()=>{};loadEvents.forEach(event=>el.removeEventListener(event,loaded));el.removeEventListener('play',start);el.removeEventListener('pause',stop);el.removeEventListener('ended',stop);el.removeEventListener('seeked',seek);};
  },[]);

  async function togglePlay(){
    const el=video.current;if(!el||starting)return;
    if(!el.paused){el.pause();return;}
    setStarting(true);setMovieFailed(false);setError('');
    try{
      if(el.error)el.load();if(el.ended)el.currentTime=0;
      // Start in the tap handler even when mobile browsers have not preloaded a frame.
      const started=el.play();
      const song=audio.current;if(song)void song.play().catch(e=>{if(e.name!=='AbortError'){song.muted=true;setMuted(true);}});
      await started;
    }catch{el.pause();audio.current?.pause();setError('재생하지 못했어요. ‘춤추기’를 다시 눌러 주세요.');}
    finally{setStarting(false);}
  }
  function toggleSound(){
    const song=audio.current,next=!muted;setMuted(next);if(!song)return;song.muted=next;
    if(!next&&video.current&&!video.current.paused)void song.play().catch(()=>{song.muted=true;setMuted(true);});
  }
  function selectFace(e:PointerEvent<HTMLCanvasElement>){
    const rect=e.currentTarget.getBoundingClientRect(),px=(e.clientX-rect.left)/rect.width,py=(e.clientY-rect.top)/rect.height;
    const slot=currentFaces.current.findIndex(face=>face&&px>=face.x&&px<=face.x+face.width&&py>=face.y&&py<=face.y+face.height);if(slot>=0)setSelected(slot);
  }
  const photo=photos[selected];
  const clock=(value:number)=>`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`;
  return <main className="pajama-page">
    <header className="pajama-header"><a href={assetUrl('?skip_intro=1')}><ArrowLeft size={16}/>{t('내 도감으로')}</a><span>PAJAMA PARTYZ</span><h1>{t('나도 파자마 파티즈 되기')}<MoonStar size={32}/></h1><p>{t('오늘 밤은 우리도 파자마 파티즈!')}<br/>{t('나와 친구들 사진을 넣고, 함께 춤춰요.')}</p></header>
    <section className="pajama-studio" aria-label={t('파자마 파티즈 영상 만들기')}>
      <div className="pajama-stage-panel"><div className="pajama-stage-title"><h2>{t('우리의 파자마 파티')}</h2><span>{photos.filter(Boolean).length}/4</span></div>
        <div className="pajama-stage">
          <video ref={video} src={danceVideo} playsInline preload="metadata" loop muted className="pajama-source-video" onError={()=>{setReady(false);setPlaying(false);setStarting(false);setMovieFailed(true);audio.current?.pause();setError('춤 영상을 불러오지 못했어요. 페이지를 새로 열어 주세요.');}}/>
          <audio ref={audio} src={assetUrl('pajama/dance-song-v2.m4a')} preload="metadata" loop muted={muted}/>
          <canvas ref={canvas} onPointerDown={selectFace} aria-label={t('파자마 파티즈 춤 영상 미리보기')} style={{aspectRatio:ready&&video.current?`${video.current.videoWidth}/${video.current.videoHeight}`:'16/9'}}/>
          {!ready&&!movieFailed&&<p className="pajama-loading" role="status">{t(starting?'영상을 준비하고 있어요…':'‘춤추기’를 누르면 영상이 시작돼요.')}</p>}
        </div>
        <div className="pajama-playback"><button onClick={()=>void togglePlay()} disabled={starting} aria-label={t(playing?'일시 정지':'춤추기')}>{playing?<Pause size={18}/>:<Play size={18}/>}<span>{t(playing?'일시 정지':'춤추기')}</span></button><button onClick={resetPlayback} disabled={!ready} aria-label={t('처음부터 보기')} title={t('처음부터 보기')}><RotateCcw size={17}/></button><input type="range" min="0" max={duration||1} step=".01" value={Math.min(time,duration||1)} aria-label={t('영상 재생 위치')} disabled={!ready} onChange={e=>{if(video.current){video.current.pause();video.current.currentTime=Number(e.target.value);}}}/><output>{clock(time)} / {clock(duration)}</output><button onClick={toggleSound} aria-label={t(muted?'영상 소리 켜기':'영상 소리 끄기')} title={t(muted?'영상 소리 켜기':'영상 소리 끄기')}>{muted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button></div>
        {ready&&<p className="pajama-track-note" role="status">{t('사진은 같은 색 파자마의 얼굴에 들어가요.')}</p>}
        {error&&<p role="alert" className="pajama-error">{t(error)}</p>}
        <p className="pajama-private-note">{t('사진과 영상은 이 브라우저에서만 편집해요.')}</p>
      </div>
      <aside className="pajama-controls"><h2><span>1</span>{t('나와 친구들 사진 넣기')}</h2><div className="pajama-members" role="group" aria-label={t('사진을 넣을 친구 고르기')}>{members.map((member,i)=><button key={member.name} aria-pressed={selected===i} onClick={()=>setSelected(i)} style={{'--member-color':member.color} as CSSProperties}>{photos[i]?<img src={photos[i]!.url} alt=""/>:<ImagePlus size={23}/>}<span>{i+1} · {t(member.name)}</span></button>)}</div>
        <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label={t('파자마 파티즈에 넣을 사진')} onChange={e=>void uploadPhoto(e.target.files?.[0])}/><button className="pajama-upload" onClick={()=>photoInput.current?.click()}><ImagePlus size={17}/>{photo?t('다른 사진 고르기'):t('사진 고르기')}</button>
        <fieldset disabled={!photo}><legend className="sr-only">{t('사진 크기와 위치 조절')}</legend><label>{t('사진 크기')}<output>{Math.round((photo?.zoom||1)*100)}%</output><input type="range" min="1" max="3" step=".01" value={photo?.zoom||1} aria-label={t('사진 크기')} onChange={e=>updatePhoto({zoom:Number(e.target.value)})}/></label><label>{t('가로 위치')}<input type="range" min="-100" max="100" value={photo?.x||0} aria-label={t('사진 가로 위치')} onChange={e=>updatePhoto({x:Number(e.target.value)})}/></label><label>{t('세로 위치')}<input type="range" min="-100" max="100" value={photo?.y||0} aria-label={t('사진 세로 위치')} onChange={e=>updatePhoto({y:Number(e.target.value)})}/></label><div className="pajama-small-actions"><button onClick={()=>updatePhoto({zoom:1,x:0,y:0})}><RotateCcw size={13}/>{t('위치 초기화')}</button><button onClick={removePhoto}><Trash2 size={13}/>{t('사진 빼기')}</button></div></fieldset>
      </aside>
    </section>
    <footer className="pajama-footer"><p>{t('회색 얼굴 칸이 선명한 장면에서 가장 잘 맞아요. 얼굴이 가려지면 사진도 잠시 숨겨져요.')}</p><a href="https://www.anime-chiikawa.jp/chara.html" target="_blank" rel="noreferrer">{t('파자마 파티즈 · 공식 캐릭터 소개')} ↗</a></footer>
  </main>;
}
