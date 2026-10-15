import {useState} from 'react';
import {RotateCcw,Sparkles} from 'lucide-react';
import {assetUrl} from './asset-url';
import {EntranceScene} from './entrance-preview';
import './capsule-preview.css';
const studies=[
 {id:1,name:'딸기 도트',tag:'기존 1번 · 배너와 같은 무드',text:'핑크 땡땡이 위에 버터 노랑·하늘색 캡슐. 열리면 사진 세 장이 부채처럼 펼쳐져요.'},
 {id:2,name:'민트 모눈',tag:'문구점 · 가지런하고 산뜻하게',text:'민트 모눈지와 연보라·민트 캡슐. 열린 사진을 반듯하게 나란히 놓아 작은 수집 노트처럼 보여요.'},
 {id:3,name:'레몬 체크',tag:'버터빛 · 통통한 캡슐과 사진 한 장',text:'노란 깅엄 체크 위에 크림·분홍 캡슐. 가장 큰 사진 한 장을 가운데 두고 두 친구가 뒤에서 고개를 내밀어요.'},
 {id:4,name:'구름 소다',tag:'하늘빛 · 가볍게 떠오르는 사진',text:'구름이 떠 있는 하늘색 바탕과 맑은 소다빛 캡슐. 사진이 서로 다른 높이로 둥실 펼쳐져요.'},
 {id:5,name:'라벤더 별빛',tag:'작은 행운 · 반짝이는 사진 묶음',text:'연보라 바탕의 별빛과 분홍·라벤더 캡슐. 세 장의 사진이 작은 선물처럼 겹쳐져 나와요.'},
];
function Study({study}:{study:typeof studies[number]}){const [open,setOpen]=useState(false);return <article className={'entrance-draft capsule-draft capsule-draft-'+study.id} id={'capsule-'+study.id}><header><span className="entrance-number">0{study.id}</span><div><span className="entrance-concept-tag">{study.tag}</span><h2>{study.name}</h2><p>{study.text}</p></div></header><div className="entrance-comparison"><section><div className="entrance-stage-label"><span>01 · 열기 전</span><button onClick={()=>setOpen(!open)} aria-pressed={open}>{open?<RotateCcw size={13}/>:<Sparkles size={13}/>} {open?'다시 보기':'열어 보기'}</button></div><EntranceScene id={1} open={open} className={'capsule-study capsule-study-'+study.id}/></section><section><div className="entrance-stage-label"><span>02 · 열린 후</span><span>사진과 함께 도감으로</span></div><EntranceScene id={1} open className={'capsule-study capsule-study-'+study.id}/></section></div></article>;}
export default function CapsulePreview(){return <main className="entrance-preview capsule-preview"><header className="entrance-preview-header"><div className="capsule-preview-links"><a href={assetUrl('entrance-preview.html#entrance-1')}>← 첫 화면 시안으로</a><a href={assetUrl('?skip_intro=1')}>내 도감 ↗</a></div><span className="entrance-preview-eyebrow">POPPING LITTLE CAPSULES</span><h1>뽀로록 캡슐, 다섯 가지 무드</h1><p>첫 번째 캡슐 시안을 바탕으로 배경 패턴, 캡슐 색과 모양, 사진이 펼쳐지는 배치를 다르게 만들었어요.</p><p className="entrance-preview-note">1번은 기존 버전이에요. ‘열어 보기’를 누르면 캡슐이 열리는 모습을 비교할 수 있어요.</p><nav aria-label="캡슐 시안 바로가기">{studies.map(s=><a key={s.id} href={'#capsule-'+s.id}>0{s.id} {s.name}</a>)}</nav></header>{studies.map(study=><Study key={study.id} study={study}/>)}<footer>딸기 도트 시안을 첫 화면에 적용했어요. <a href={assetUrl('?welcome=1')}>적용된 첫 화면 보기 ↗</a></footer></main>;}
