import GachaHero from './gacha-hero';
import {assetUrl} from './asset-url';
import './title-preview.css';
const designs=[
 {name:'단정한 정렬',note:'‘먼·작·귀’와 ‘뽑기’를 같은 크기로, 마지막 줄에 가지런히 맞춰요.'},
 {name:'크게, 뽑기',note:'설명은 작게, ‘뽑기’는 크게. 두 단계의 글자 크기로 중심을 분명하게 만들어요.'},
 {name:'티켓 라벨',note:'‘뽑기’를 작은 티켓처럼 묶어, 문구와 놀이의 이름을 구분해요.'},
 {name:'세로 간판',note:'오른쪽의 ‘뽑기’를 세로로 세워 작은 가챠 가게의 간판처럼 보여줘요.'},
 {name:'손글씨 초대',note:'‘먼·작·귀’는 부드러운 손글씨로, ‘뽑기’는 둥근 글자로 또렷하게.'},
];
export default function TitlePreview(){return <main className="gacha-preview-page title-preview-page"><header className="gacha-preview-header"><a href={assetUrl('?skip_intro=1')}>← 내 치이들 보관함으로</a><span className="title-preview-eyebrow">CHIIKAWA GACHA · TYPE STUDIES</span><h1>뽑기 타이틀, 글자의 위계 5가지</h1><p>‘먼·작·귀’는 세로로, ‘뽑기’는 오른쪽에.<br/>같은 문구와 같은 배너에서 글자 크기와 배치만 비교해 보세요.</p><nav aria-label="타이틀 디자인 시안 바로가기">{designs.map((d,i)=><a href={'#title-'+(i+1)} key={d.name}>0{i+1} · {d.name}</a>)}</nav></header>{designs.map((d,i)=><article className="gacha-draft title-draft" id={'title-'+(i+1)} key={d.name}><header><h2><small>0{i+1}</small>{d.name}</h2><p>{d.note}</p></header><GachaHero colorVariant={12} titleDesign={i+1} onCollect={()=>{}} onRandom={()=>{}}/></article>)}<footer className="title-preview-footer">비교용 시안이에요. 미리보기 뽑기는 도감 기록을 바꾸지 않아요.<a href={assetUrl('?skip_intro=1')}>내 치이들 보관함으로 ↗</a></footer></main>;}
