import GachaHero,{type BannerCopy} from './gacha-hero';
import {assetUrl} from './asset-url';
const options:{name:string;copy:BannerCopy}[]=[
 {name:'치이카와 가챠 · 직관적인 이름',copy:{eyebrow:'CHIIKAWA GACHA',title:['오늘의 치이카와,','누가 나올까?'],marquee:'LUCKY CHIIKAWA'}},
 {name:'뽀로록 · 캡슐이 나오는 순간',copy:{eyebrow:'LITTLE GACHA CLUB',title:['귀여움 한 캡슐,','뽀로록 만나봐!'],marquee:'A LITTLE SURPRISE'}},
 {name:'오늘의 최애 · 수집하는 즐거움',copy:{eyebrow:'CHIIKAWA FRIENDS',title:['작은 캡슐 속,','오늘의 최애는?'],marquee:'FIND YOUR FAVORITE'}},
 {name:'가챠 데이 · 가볍고 친근하게',copy:{eyebrow:'GACHA DAY',title:['오늘도 한 번,','귀여움 뽑아볼까?'],marquee:'ONE CAPSULE, ONE SMILE'}},
 {name:'작은 행복 · 따뜻한 분위기',copy:{eyebrow:'CUTE LUCK CLUB',title:['집게 끝에 걸린,','작은 행복 한 장.'],marquee:'PICK YOUR LITTLE JOY'}},
];
const siteNames=['치이카와 가챠','치이카와 뽀로록','오늘의 치이카와','치이카와 캡슐','치이카와 작은 상점','치이카와 놀이터','치이카와 귀여움 보관함','치이카와 친구 뽑기','치이카와 가챠 클럽','치이카와 별표 서랍'];
export default function NamingPreview(){return <main className="gacha-preview-page"><header className="gacha-preview-header"><a href={assetUrl('')}>← 내 도감으로</a><h1>치이카와 가챠 · 배너 문구 시안 5가지</h1><p>핑크 땡땡이 배경과 노란 뽑기는 동일하게 두고, 제목과 간판 문구를 비교해 보세요.</p><nav aria-label="문구 시안 바로가기">{options.map((o,i)=><a href={'#naming-'+(i+1)} key={o.name}>{i+1}. {o.name.split(' · ')[0]}</a>)}</nav><section className="naming-candidates" aria-label="웹사이트 이름 후보 10가지"><h2>웹사이트 이름 후보 10가지</h2><p>‘치이카와 가챠’가 가장 바로 이해돼요. 가볍고 귀여운 별칭을 원하면 ‘치이카와 뽀로록’도 어울려요.</p><ol>{siteNames.map((name,i)=><li key={name}><small>{String(i+1).padStart(2,'0')}</small>{name}</li>)}</ol></section></header>{options.map((o,i)=><article className="gacha-draft" id={'naming-'+(i+1)} key={o.name}><header><h2><small>{String(i+1).padStart(2,'0')}</small>{o.name}</h2></header><GachaHero colorVariant={12} copy={o.copy} onCollect={()=>{}} onRandom={()=>{}}/></article>)}</main>}
