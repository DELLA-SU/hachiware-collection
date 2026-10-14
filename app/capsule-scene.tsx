import {ArrowUpRight,Star} from 'lucide-react';
import {assetUrl} from './asset-url';
import {t,useLanguage} from './locale';
import './entrance-scene.css';

const photos=['letter-photo-1.jpg','letter-photo-2.jpg','letter-photo-3.jpg'];
export default function CapsuleScene({open,className='',onOpen,showWelcome=true}:{open:boolean;className?:string;onOpen?:()=>void;showWelcome?:boolean}){
 const language=useLanguage();
 const Capsule=onOpen?'button':'div';
 return <div className={'entrance-scene entrance-1 '+className+(open?' is-open':'')} aria-label={open?t('열린 후 모습'):t('열기 전 모습')}>
  <span className="entrance-kicker">CHIIKAWA GACHA</span>
  <Capsule className={'entrance-capsule'+(onOpen?' capsule-open-control':'')} {...(onOpen?{type:'button' as const,onClick:onOpen,disabled:open,'aria-label':t('캡슐 열기'),'aria-expanded':open}: {'aria-hidden':true})}>
   <div className="capsule-top"><Star size={24}/></div><div className="capsule-bottom"><img className="entrance-mascot" src={assetUrl('hachiware-favicon.png')} alt=""/></div><div className="capsule-band"/>
  </Capsule>
  <div className="entrance-photos" aria-hidden={!open}>{photos.map((src,i)=><div className="entrance-print" key={src}><img src={assetUrl(src)} alt={t(['하치와레와 친구들 사진','귀여운 치이카와 사진','함께 있는 친구들 사진'][i])}/><span>{t(['오늘의 친구','별표 한 순간','작은 행복'][i])}</span></div>)}</div>
  <div className="entrance-closed-copy" aria-hidden={open}><h3 className={'capsule-title'+(language==='ko'?' capsule-acrostic':'')} aria-label={t('먼가 작고 귀여운 뽑기!')}>{language==='ko'?<><span><em>먼</em>가</span><span><em>작</em>고</span><span><em>귀</em>여운</span><span>뽑기!</span></>:t('먼가 작고 귀여운 뽑기!')}</h3></div>
  {showWelcome&&<div className="entrance-welcome" aria-hidden={!open}><strong className="capsule-title">{language==='ko'?<><span>짜잔, 먼가 작고</span><span>귀여운 친구들이에요!</span></>:t('짜잔, 먼가 작고 귀여운 친구들이에요!')}</strong><span>{t('귀여움 보관함으로')}<ArrowUpRight size={13}/></span></div>}
 </div>;
}
