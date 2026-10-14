import {t,useLanguage,languageLocale} from './locale';
import type {ReactNode} from 'react';
import {Sparkles,Shuffle,Star,Music2,Search,Share2,MousePointer2,Move,RotateCw,Volume2,ArrowRight} from 'lucide-react';
const web=[
 {icon:Sparkles,title:'치이카와 뽑기',text:'집게가 둥근 캡슐을 집어 올리고 출구에서 꺼내면 큰 사진 창이 열려요. 아직 만나지 않은 친구가 도감에 추가되고, 모두 만나면 기존 친구를 다시 보여줘요.'},
 {icon:Shuffle,title:'모은 사진 다시 만나기',text:'이미 모은 사진 중 한 장을 랜덤으로 펼쳐요. 배너의 초록색 ‘모은 사진 다시 만나기’ 게임 버튼도 같은 기능이에요. 검색이나 별표를 선택했다면 그 결과 안에서 골라요.'},
 {icon:Star,title:'별표로 모아 보기',text:'사진 카드의 별표나 사진 창의 ‘별표 붙이기’를 누르면 즐겨찾기에 담겨요. 왼쪽 ‘별표 한 순간’에서 모아 보고, 다시 누르면 별표가 해제돼요.'},
 {icon:Music2,title:'하치와레 노래 TV',text:'TV 창이 열리면서 노래가 재생돼요. 영상 안에서 일시정지·볼륨·전체 화면을 조절할 수 있어요. TV 창을 닫으면 재생도 멈춰요.'},
 {icon:Search,title:'사진 찾고 정리하기',text:'검색창에서 사진 번호·날짜·출처를 찾아요. ‘만난 날짜’를 펼쳐 날짜를 고르고, 정렬과 배치 버튼으로 보기 방식을 바꿔요. 카드의 ×로 지운 사진은 ‘실행 취소’로 되돌릴 수 있어요.'},
 {icon:Share2,title:'크게 보고 출처 공유하기',text:'사진 창에서 확대하거나 창 크기를 키워 보세요. ‘원본 열기’로 출처를 방문하고, ‘출처와 공유’로 원본 링크를 공유할 수 있어요.'},
];
const desktop=[
 {icon:MousePointer2,title:'한 번 클릭 · 사진 만나기',text:'바탕화면 치이 친구를 한 번 누르면 랜덤 사진 창이 떠요. ‘웹사이트 바로가기’로 웹 도감을 열 수 있어요.'},
 {icon:Music2,title:'두 번 클릭 · 노래 듣기',text:'캐릭터를 빠르게 두 번 누르면 바탕화면에 치이카와 TV가 열리고 노래가 바로 재생돼요. 창을 닫으면 음악도 멈춰요.'},
 {icon:Move,title:'드래그 · 자리 옮기기',text:'캐릭터를 잡아 원하는 위치로 끌어 놓아요. 오른쪽 클릭이나 메뉴 막대의 발바닥에서 위치 초기화와 종료를 선택할 수 있어요.'},
 {icon:RotateCw,title:'마우스 올리기 · 통통 튀기',text:'캐릭터 위에 마우스를 올리면 점점 빠르게 돌아요. 5초 동안 올려두면 화면 가장자리에 통통 튀었다가 제자리로 돌아와요.'},
];
export default function CollectionGuide({brand,onDone}:{brand:ReactNode;onDone:()=>void}){
 useLanguage();return <>
 <header className="guide-head"><span className="about-face">{brand}</span><h2>{t("도감 사용법")}</h2></header>
 <section className="guide-section" aria-label={t("웹 도감 사용법")}><h3>{t("웹 도감에서")}</h3><div className="guide-grid">{web.map(({icon:Icon,title,text})=><article className="guide-card" key={title}><Icon size={20} aria-hidden="true"/><div><h4>{t(title)}</h4><p>{t(text)}</p></div></article>)}</div></section>
 <section className="guide-section" aria-label={t("바탕화면 캐릭터 사용법")}><h3>{t("바탕화면 치이 친구")}</h3><p className="guide-install">{t("왼쪽 ‘바탕화면 치이 친구 받기’를 누르면 팝업에서 맥용·윈도우용을 선택하고 설치 방법도 볼 수 있어요. 맥은 압축을 풀고 응용 프로그램 폴더에 옮겨 실행하고, 윈도우는 ZIP의 압축을 모두 풀고 Hachiware.exe를 실행해요.")}</p><div className="guide-grid desktop-guide">{desktop.map(({icon:Icon,title,text})=><article className="guide-card" key={title}><Icon size={20} aria-hidden="true"/><div><h4>{t(title)}</h4><p>{t(text)}</p></div></article>)}</div></section>
 <section className="guide-section guide-sound"><Volume2 size={20} aria-hidden="true"/><div><h3>{t("목소리와 효과음")}</h3><p>{t("우사기 사진을 펼치거나 다시 누르면 실제 목소리가 랜덤으로 나와요. 웹 도감에서는 ‘효과음’의 ON/OFF, 바탕화면에서는 오른쪽 클릭 메뉴의 ‘효과음 켜기’로 목소리와 동작 효과음을 조절해요. 노래 영상의 소리는 TV 안에서 별도로 조절해요.")}</p></div></section>

 <button className="about-done" onClick={onDone}>{t("도감으로 돌아가기")}<ArrowRight size={17}/></button>
 </>}
