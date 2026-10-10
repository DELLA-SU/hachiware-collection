export const assetUrl=(path:string)=>((import.meta as any).env?.BASE_URL||'/')+path.replace(/^\/+/, '');
