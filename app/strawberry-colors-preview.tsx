import {useState} from 'react';
import {ColorDraft} from './gacha-colors-preview';
import {assetUrl} from './asset-url';
const options=[{color:7,name:'파랑'},{color:11,name:'초록'},{color:12,name:'노랑'}];
export default function StrawberryColorsPreview(){
 const [selected,setSelected]=useState(()=>{try{return localStorage.getItem('hachiware-gacha-variant')==='1'?Number(localStorage.getItem('hachiware-crane-color')):-1;}catch{return -1;}});
 function apply(color:number){localStorage.setItem('hachiware-crane-color',String(color));localStorage.setItem('hachiware-gacha-variant','1');setSelected(color);}
 return <main className="gacha-preview-page"><header className="gacha-preview-header"><div className="crane-page-links"><a href={assetUrl('')} target="_blank" rel="noreferrer">내 도감에서 적용 화면 보기 ↗</a><a href={assetUrl('gacha-colors-preview.html')}>← 전체 시안</a></div><h1>딸기 도트 뽑기 · 파랑, 초록, 노랑</h1><p>같은 딸기 도트 배경에 뽑기 기계 색만 바꿨어요. 파랑은 ‘별표 한 순간’ 카드와 같은 색이에요.</p><nav aria-label="뽑기 기계 색상 바로가기">{options.map((p,i)=><a key={p.color} href={'#color-'+p.color}>{i+1}. {p.name}</a>)}</nav></header>{options.map((p,i)=><ColorDraft key={p.color} color={p.color} numberLabel={String(i+1).padStart(2,'0')} nameLabel={p.name} selected={selected===p.color} onApply={()=>apply(p.color)}/>)}</main>;
}
