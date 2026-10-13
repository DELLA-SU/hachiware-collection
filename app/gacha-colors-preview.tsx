import {useState} from 'react';
import GachaHero from './gacha-hero';
import {cranePalettes} from './gacha-colors';
import {assetUrl} from './asset-url';
const samples=['photos/aa42303fbf1304d40fe8f65c558aeaaf37fa9130a716e763c22428f544be67ee.jpg','photos/ad77fa9586277d8a6a6887cfe006a33a52d4cd251eb1382a72f3c2e4c86be955.jpg','photos/1ac18cc3ea699efb5d8892ffef00813c18da132752e48d0f9da0aa810e0712ef.jpg'];
function ColorDraft({color,selected,onApply}:{color:number;selected:boolean;onApply:()=>void}){
 const [busy,setBusy]=useState(false),[result,setResult]=useState('');const palette=cranePalettes[color-1];
 function draw(){if(busy)return;setBusy(true);setResult('');setTimeout(()=>{setResult(assetUrl(samples[Math.floor(Math.random()*samples.length)]));setBusy(false)},1100);}
 return <article id={'color-'+color} className="gacha-draft"><header><div className="crane-color-title"><h2><small>{String(color).padStart(2,'0')}</small>{palette.name}</h2><span className="crane-swatches" aria-label="배경, 기계, 버튼 색상">{palette.swatches.map(s=><i key={s} style={{background:s}}/>)}</span></div><button aria-pressed={selected} onClick={onApply}>{selected?'적용됨 ✓':'이 색상 적용'}</button></header><GachaHero variant={1} colorVariant={color} busy={busy} result={result} onCollect={draw}/></article>;
}
export default function GachaColorsPreview(){
 const [selected,setSelected]=useState(()=>{try{const n=Number(localStorage.getItem('hachiware-crane-color'));return localStorage.getItem('hachiware-gacha-variant')==='1'&&n>=1&&n<=5?n:0;}catch{return 0;}});
 function apply(n:number){localStorage.setItem('hachiware-crane-color',String(n));localStorage.setItem('hachiware-gacha-variant','1');setSelected(n);}
 return <main className="gacha-preview-page"><header className="gacha-preview-header"><div className="crane-page-links"><a href={assetUrl('')} target="_blank" rel="noreferrer">내 도감에서 적용 화면 보기 ↗</a><a href={assetUrl('gacha-preview.html')}>← 이전 배치 시안</a></div><h1>핑크 크레인 · 색 조합 5가지</h1><p>첫 번째 시안의 배치와 크기를 유지했어요. 미리보기 뽑기는 도감 기록을 바꾸지 않아요.</p><nav aria-label="크레인 색상 시안 바로가기">{cranePalettes.map((p,i)=><a key={p.name} href={'#color-'+(i+1)}>{i+1}. {p.name}</a>)}</nav></header>{cranePalettes.map((_,i)=><ColorDraft key={i} color={i+1} selected={selected===i+1} onApply={()=>apply(i+1)}/>)}</main>;
}
