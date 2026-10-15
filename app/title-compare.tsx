import GachaHero from './gacha-hero';
import {assetUrl} from './asset-url';
import './title-preview.css';
export default function TitleCompare(){return <main className="gacha-preview-page title-merge-page"><header className="gacha-preview-header"><a href={assetUrl('?skip_intro=1')}>← 내 치이들 보관함으로</a><span className="title-preview-eyebrow">CHIIKAWA GACHA · COMBINED TITLE</span><h1>기본 글씨 + 밑줄 뽑기!</h1><p>왼쪽은 기본 글씨체로, 오른쪽은 노란 밑줄이 있는 ‘뽑기!’로 합쳤어요.</p></header><article className="gacha-draft title-draft" id="combined"><GachaHero colorVariant={12} titleDesign={6} onCollect={()=>{}} onRandom={()=>{}}/></article><footer className="title-preview-footer"><a href={assetUrl('?skip_intro=1')}>메인 보관함에서 보기 ↗</a><a href={assetUrl('title-preview.html')}>앞서 만든 시안 5개 보기 ↗</a></footer></main>;}
