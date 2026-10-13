import {useSyncExternalStore} from 'react';
export type Language='ko'|'en'|'zh'|'ja';
const key='hachiware-language';
const allowed=['ko','en','zh','ja'];
let active:Language='ko';try{const value=localStorage.getItem(key);if(value&&allowed.includes(value))active=value as Language;}catch{}
const listeners=new Set<()=>void>();
function emit(){document.documentElement.lang=active;listeners.forEach(fn=>fn());}
export function setLanguage(language:Language){active=language;try{localStorage.setItem(key,language);}catch{}emit();}
if(typeof window!=='undefined'){document.documentElement.lang=active;window.addEventListener('storage',e=>{if(e.key===key&&e.newValue&&allowed.includes(e.newValue)){active=e.newValue as Language;emit();}});}
export function useLanguage(){return useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn);},()=>active,()=>active);}
export const languageLocale=()=>({ko:'ko-KR',en:'en-US',zh:'zh-CN',ja:'ja-JP'}[active]);
import {translations} from './translations';
export function t(text:string){return active==='ko'?text:translations[text]?.[active]||text;}

export function countUnit(value:number,label:'일'|'장'){return active==='en'?(label==='일'?(value===1?' day':' days'):(value===1?' photo':' photos')):t(label);}
