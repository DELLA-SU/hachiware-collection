import GachaHero,{type BannerCopy} from './gacha-hero';
import {assetUrl} from './asset-url';
const options:{name:string;tone:string;copy:BannerCopy}[]=[
 {name:'오늘의 너에게',tone:'추천 · 친구를 선물하는 느낌',copy:{eyebrow:'CHIIKAWA GACHA',title:['오늘의 너에게,','작은 친구 하나.'],marquee:'작은 친구, 큰 행복'}},
 {name:'네 편이 되어줄까?',tone:'치이들과의 만남 · 다정한 질문',copy:{eyebrow:'CHIIKAWA GACHA',title:['오늘은 어떤 친구가,','네 편이 되어줄까?'],marquee:'오늘도 네 편'}},
 {name:'잘 왔어',tone:'반가운 환영 · 짧고 따뜻하게',copy:{eyebrow:'CHIIKAWA GACHA',title:['잘 왔어,','귀여움이 기다렸어.'],marquee:'어서 와, 작은 친구들'}},
 {name:'수고한 너에게',tone:'응원 · 현재 문구를 더 간결하게',copy:{eyebrow:'CHIIKAWA GACHA',title:['수고한 너에게,','귀여움 하나.'],marquee:'오늘의 작은 선물'}},
 {name:'귀여움 한 장',tone:'사진 수집 · 가벼운 기분 전환',copy:{eyebrow:'CHIIKAWA GACHA',title:['귀여움 한 장,','기분은 한 뼘 더.'],marquee:'한 장씩, 좋아하는 마음'}},
 {name:'오늘의 작은 행복',tone:'가챠의 설렘 · 가장 직관적인 문구',copy:{eyebrow:'CHIIKAWA GACHA',title:['오늘의 작은 행복,','한 번 뽑아볼까?'],marquee:'뽀로록, 오늘의 치이'}},
 {name:'좋아하는 마음',tone:'수집하는 공간 · 오래 쓰기 좋은 문구',copy:{eyebrow:'CHIIKAWA GACHA',title:['좋아하는 마음이,','뽀로록 쌓이는 곳.'],marquee:'치이들의 작은 보관함'}},
 {name:'작은 친구들과',tone:'함께하는 일상 · 편안한 브랜드 무드',copy:{eyebrow:'CHIIKAWA GACHA',title:['작은 친구들로,','채우는 나의 하루.'],marquee:'치이들과 함께'}},
 {name:'뽑고 싶은 하루',tone:'가챠의 장난스러움 · 가볍고 기억하기 쉽게',copy:{eyebrow:'CHIIKAWA GACHA',title:['오늘도 뽀로록,','귀여운 하루를 뽑아봐.'],marquee:'행복 한 캡슐'}},
 {name:'작은 친구의 인사',tone:'치이들의 환영 · 말 걸듯 친근하게',copy:{eyebrow:'CHIIKAWA GACHA',title:['기다리고 있었어,','오늘도 만나서 반가워!'],marquee:'치이들의 반가운 인사'}},
];
const siteNames=['치이카와 가챠','치이카와 뽀로록','치이들의 작은 가챠','오늘의 치이카와','치이 가챠 클럽','귀여움 한 캡슐','치이 친구 상점','작은 친구 뽑기','먼작귀 작은 상점','치이들의 귀여움 보관함'];
export default function NamingPreview(){return <main className="gacha-preview-page branding-preview"><header className="gacha-preview-header"><a href={assetUrl('')}>← 치이카와 가챠로</a><span className="branding-eyebrow">CHIIKAWA GACHA · BRAND VOICE</span><h1>작은 친구가 말을 건네는 타이틀 10개</h1><p>사이트 이름은 ‘치이카와 가챠’. 서브 문구 없이 큰 타이틀과 뽑기 간판만으로, 따뜻한 응원과 만남의 설렘을 비교해 보세요.</p><nav aria-label="브랜딩 타이틀 시안 바로가기">{options.map((option,i)=><a href={'#naming-'+(i+1)} key={option.name}>{i+1}. {option.name}</a>)}</nav><aside className="naming-story-recommendation"><small>추천 조합 · 다정함과 가챠의 설렘</small><dl><div><dt>웹사이트 이름</dt><dd>치이카와 가챠</dd></div><div><dt>브랜딩 타이틀</dt><dd>오늘의 너에게, 작은 친구 하나.</dd></div><div><dt>뽑기 간판</dt><dd>작은 친구, 큰 행복</dd></div></dl><p>치이들을 하나 뽑는 경험이 ‘나를 위한 작은 선물’처럼 느껴져요. 짧아서 기억하기 쉽고, 가챠와 떠다니는 바탕화면 친구에도 함께 쓸 수 있어요.</p><a className="branding-current-link" href={assetUrl('')}>현재 적용 문구: 먼가 작고 귀여운 뽑기! ↗</a></aside><section className="naming-candidates" aria-label="브랜드 이름 참고 후보 10가지"><h2>브랜드 이름을 더 짧게 부른다면</h2><p>현재 이름은 ‘치이카와 가챠’로 통일했어요. 아래 이름은 비교용 별칭 후보예요.</p><ol>{siteNames.map((name,i)=><li key={name}><small>{String(i+1).padStart(2,'0')}</small>{name}</li>)}</ol></section></header>{options.map((option,i)=><article className="gacha-draft branding-draft" id={'naming-'+(i+1)} key={option.name}><header><h2><small>{String(i+1).padStart(2,'0')}</small>{option.name}</h2><p>{option.tone}</p></header><GachaHero colorVariant={12} copy={option.copy} onCollect={()=>{}} onRandom={()=>{}}/></article>)}<footer className="branding-footer">비교용 시안이에요. 추천 타이틀은 아직 메인 화면에 적용하지 않았어요.</footer></main>;}
