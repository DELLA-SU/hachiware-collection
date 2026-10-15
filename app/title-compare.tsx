import GachaHero from './gacha-hero';
import {assetUrl} from './asset-url';
import './title-preview.css';
const options=[
 {id:'underline',number:'01',design:5,name:'밑줄 장식 버전',note:'첨부하신 느낌 그대로, 큰 ‘뽑기!’에 살짝 기울어진 노란 밑줄을 더했어요.'},
 {id:'plain',number:'02',design:1,name:'기본 텍스트 버전',note:'문구와 ‘뽑기!’를 같은 크기로, 기울임과 밑줄 없이 가지런히 맞췄어요.'},
];
export default function TitleCompare(){return <main className="gacha-preview-page title-preview-page title-compare-page"><header className="gacha-preview-header"><a href={assetUrl('?skip_intro=1')}>← 내 치이들 보관함으로</a><span className="title-preview-eyebrow">CHIIKAWA GACHA · TWO TYPE OPTIONS</span><h1>밑줄을 더할까, 글자만 둘까?</h1><p>같은 분홍 도트 배너에서 두 가지 타이틀을 비교해 보세요.</p><nav aria-label="타이틀 시안 바로가기">{options.map(o=><a href={'#'+o.id} key={o.id}>{o.number} · {o.name}</a>)}</nav></header>{options.map(o=><article className="gacha-draft title-draft" id={o.id} key={o.id}><header><h2><small>{o.number}</small>{o.name}</h2><p>{o.note}</p></header><GachaHero colorVariant={12} titleDesign={o.design} drawLabel="뽑기!" onCollect={()=>{}} onRandom={()=>{}}/></article>)}<footer className="title-preview-footer">비교용 시안이에요.<a href={assetUrl('title-preview.html')}>앞서 만든 시안 5개 보기 ↗</a></footer></main>;}
