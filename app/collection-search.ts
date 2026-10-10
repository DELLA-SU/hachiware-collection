type SearchPhoto={title:string;source_kind:string;character?:string};
export function photoMatchesSearch(photo:SearchPhoto,photoNumber:string,photoDay:string,input:string){
 const query=input.trim().toLowerCase();
 if(!query)return true;
 // Bare short numbers identify a card, rather than matching every October date.
 const number=query.match(/^#?(\d{1,3})$/);
 if(number)return Number(photoNumber)===Number(number[1]);
 const date=query.match(/^(\d{4})(?:[.\/-](\d{1,2}))?(?:[.\/-](\d{1,2}))?$/);
 if(date){
  const prefix=[date[1],date[2]?.padStart(2,'0'),date[3]?.padStart(2,'0')].filter(Boolean).join('-');
  return photoDay.startsWith(prefix);
 }
 const names=photo.character==='usagi'?'우사기 usagi':photo.character==='hachiware'?'하치와레 hachiware':photo.character==='chiikawa'?'치이카와 chiikawa':'';
 const text=[photo.title,photo.source_kind,photoDay,photoDay.replaceAll('-','.'),photoNumber,names].join(' ').toLowerCase();
 return query.split(/\s+/).every(term=>text.includes(term));
}
