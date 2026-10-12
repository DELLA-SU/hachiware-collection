import keywords from '../lib/collection-keywords.json';
export const characterName=(id?:string)=>keywords.find(k=>k.id===id)?.name||'하치와레';
