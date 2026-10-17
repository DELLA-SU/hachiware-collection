import {useEffect,useRef,useState} from 'react';
import {Check,Download,NotebookPen} from 'lucide-react';
import {apiFetch} from '../lib/browser-api';
import {t,useLanguage} from './locale';

type Draft={note:string;strokes:any[]};
export default function PhotoMemo({id,imageUrl,filename}:{id:string;imageUrl:string;filename:string}){
 useLanguage();
 const [note,setNote]=useState(''),[loaded,setLoaded]=useState(false),[status,setStatus]=useState('불러오는 중…'),[error,setError]=useState('');
 const data=useRef<Draft>({note:'',strokes:[]}),revision=useRef(0),dirty=useRef(false),mounted=useRef(true),timer=useRef<ReturnType<typeof setTimeout>|null>(null),queue=useRef(Promise.resolve());
 const key='hachiware-annotation-draft-'+id;
 function keepDraft(){try{localStorage.setItem(key,JSON.stringify({...data.current,revision:revision.current}));}catch{}}
 function save(){
  if(!dirty.current)return;const snapshot=data.current;dirty.current=false;if(mounted.current)setStatus('저장 중…');
  queue.current=queue.current.then(async()=>{try{const response=await apiFetch('/api/annotation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,...snapshot,revision:revision.current})}),result=await response.json();if(!response.ok)throw new Error(result.error);revision.current=result.revision;
   if(data.current===snapshot){try{localStorage.removeItem(key);}catch{}if(mounted.current){setStatus('저장했어요');setError('');}}else keepDraft();
  }catch(error:any){dirty.current=true;keepDraft();if(mounted.current){setStatus('저장 필요');setError(error.message||'저장하지 못했어요.');}}});
 }
 useEffect(()=>{
  mounted.current=true;let canceled=false;
  apiFetch('/api/annotation?id='+encodeURIComponent(id),{cache:'no-store'}).then(async response=>{const result=await response.json();if(!response.ok)throw new Error(result.error);return result;}).then(result=>{
   if(canceled)return;revision.current=result.revision;let draft:any=null;try{draft=JSON.parse(localStorage.getItem(key)||'null');}catch{}
   const recover=draft&&draft.revision===result.revision&&typeof draft.note==='string'&&draft.note.length<=4000&&Array.isArray(draft.strokes);
   data.current=recover?{note:draft.note,strokes:draft.strokes}:{note:result.note,strokes:result.strokes};setNote(data.current.note);setLoaded(true);setStatus('저장했어요');
   if(recover){dirty.current=true;setStatus('이전 편집 복원 · 저장 대기');timer.current=setTimeout(save,700);}else if(draft)setError('다른 창에서 저장된 최신 기록을 불러왔어요.');
  }).catch(error=>{if(!canceled){setError(error.message);setStatus('불러오기 실패');}});
  return()=>{canceled=true;mounted.current=false;if(timer.current)clearTimeout(timer.current);save();};
 },[id]);
 function update(value:string){data.current={...data.current,note:value};setNote(value);dirty.current=true;keepDraft();setStatus('저장 대기');if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(save,700);}
 return <section className="photo-notes photo-memo" aria-label={t('사진 메모')}><div className="notes-heading"><strong><NotebookPen size={15}/>{t('메모')}</strong><span role="status" className="notes-status">{status==='저장했어요'&&<Check size={12}/>} {t(status)}</span><a className="notes-save" href={imageUrl} download={filename}><Download size={14}/>{t('사진 저장')}</a></div>{error&&<p className="notes-error" role="alert">{t(error)}</p>}<textarea aria-label={t('이 사진의 메모')} placeholder={t('이 순간에 남기고 싶은 말…')} value={note} disabled={!loaded} maxLength={4000} onChange={e=>update(e.target.value)} onBlur={save}/><small className="notes-count">{note.length} / 4000</small></section>;
}
