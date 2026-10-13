import {t} from './locale';
import keywords from '../lib/collection-keywords.json';
export const characterName=(id?:string)=>t(keywords.find(k=>k.id===id)?.name||'하치와레');
