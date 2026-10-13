import {useState} from 'react';
import GachaHero from './gacha-hero';
import {cranePalettes} from './gacha-colors';
import {assetUrl} from './asset-url';
import {readBannerPreference,applyBannerPreference} from './banner-preferences';
const samples=['photos/aa42303fbf1304d40fe8f65c558aeaaf37fa9130a716e763c22428f544be67ee.jpg','photos/ad77fa9586277d8a6a6887cfe006a33a52d4cd251eb1382a72f3c2e4c86be955.jpg','photos/1ac18cc3ea699efb5d8892ffef00813c18da132752e48d0f9da0aa810e0712ef.jpg'];
export function ColorDraft({color,selected,onApply,numberLabel,nameLabel}:{color:number;selected:boolean;onApply:()=>void;numberLabel?:string;nameLabel?:string}){
 const [busy,setBusy]=useState(false),[result,setResult]=useState('');const palette=color===0?{name:'기존 핑크 크레인',swatches:['#dcecee','#ecc4d0','#f2c8d5']}:cranePalettes[color-1];
 function draw(){if(busy)return;setBusy(true);setResult('');setTimeout(()=>{setResult(assetUrl(samples[Math.floor(Math.random()*samples.length)]));setBusy(false)},1100);}
 return <article id={'color-'+color} className="gacha-draft"><header><div className="crane-color-title"><h2><small>{numberLabel??(color===0?'원본':String(color).padStart(2,'0'))}</small>{nameLabel??palette.name}</h2><span className="crane-swatches" aria-label="배경, 기계, 버튼 색상">{palette.swatches.map(s=><i key={s} style={{background:s}}/>)}</span></div><button aria-pressed={selected} onClick={onApply}>{selected?'적용됨 ✓':'이 시안 적용'}</button></header><GachaHero variant={1} colorVariant={color} busy={busy} result={result} onCollect={draw}/></article>;
}
export default function GachaColorsPreview(){
 const [selected,setSelected]=useState(()=>{const p=readBannerPreference();return p.variant===1?p.color:-1;});
 function apply(n:number){applyBannerPreference(1,n);setSelected(n);}
 return <main className="gacha-preview-page"><header className="gacha-preview-header"><div className="crane-page-links"><a href={assetUrl('')} target="_blank" rel="noreferrer">내 도감에서 적용 화면 보기 ↗</a><a href={assetUrl('gacha-preview.html')}>← 이전 배치 시안</a></div><h1>크레인 배너 · 색상과 패턴 시안</h1><p>원본과 기존 색상 5개, 새 패턴 5개를 함께 모았어요. 배너 크기와 배치는 동일해요.</p><nav aria-label="시안 묶음 바로가기"><a href="#color-0">원본 핑크 크레인</a><a href="#new-patterns">새 패턴 5개</a><a href="#existing-colors">기존 색상 5개</a></nav><nav aria-label="크레인 색상 시안 바로가기">{cranePalettes.slice(0,10).map((p,i)=><a key={p.name} href={'#color-'+(i+1)}>{i+1}. {p.name}</a>)}</nav><a className="crane-colors-link" href={assetUrl('strawberry-colors-preview.html')}>딸기 도트 · 파랑·초록·노랑 비교 ↗</a></header><ColorDraft color={0} selected={selected===0} onApply={()=>apply(0)}/><section id="new-patterns" className="crane-series" aria-label="새 패턴 시안 5개"><header className="crane-series-heading"><h2>새 패턴 시안</h2><span>06 — 10</span></header>{cranePalettes.slice(5,10).map((_,i)=><ColorDraft key={i+6} color={i+6} selected={selected===i+6} onApply={()=>apply(i+6)}/>)}</section><section id="existing-colors" className="crane-series" aria-label="기존 색상 시안 5개"><header className="crane-series-heading"><h2>기존 색상 시안</h2><span>01 — 05</span></header>{cranePalettes.slice(0,5).map((_,i)=><ColorDraft key={i+1} color={i+1} selected={selected===i+1} onApply={()=>apply(i+1)}/>)}</section></main>;
}
