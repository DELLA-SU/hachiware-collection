import {cranePalettes} from './gacha-colors';
const revision='strawberry-yellow-20261013';
const finalBanner={variant:1,color:12};
export function applyBannerPreference(variant:number,color:number){
 try{localStorage.setItem('hachiware-crane-color',String(color));localStorage.setItem('hachiware-gacha-variant',String(variant));localStorage.setItem('hachiware-banner-revision',revision);}catch{}
}
export function readBannerPreference(){
 try{
  if(localStorage.getItem('hachiware-banner-revision')!==revision)applyBannerPreference(finalBanner.variant,finalBanner.color);
  const variant=Number(localStorage.getItem('hachiware-gacha-variant'));
  const storedColor=localStorage.getItem('hachiware-crane-color'),color=storedColor===null?finalBanner.color:Number(storedColor);
  return {variant:variant>=1&&variant<=5?variant:finalBanner.variant,color:color>=0&&color<=cranePalettes.length?color:finalBanner.color};
 }catch{return finalBanner;}
}
