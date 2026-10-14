import {t,useLanguage,languageLocale} from './locale';
import {trackEvent} from './analytics';
import {useEffect,useRef,useState} from 'react';
import {Download,X,ArrowUpRight} from 'lucide-react';
import {assetUrl} from './asset-url';

export default function InstallGuide({onClose}:{onClose:()=>void}){
 useLanguage();
 const [platform,setPlatform]=useState<'mac'|'windows'>(()=>typeof navigator!=='undefined'&&/Win/.test(navigator.platform)?'windows':'mac');
 const dialog=useRef<HTMLElement>(null),close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';close.current?.focus();
  function keydown(e:KeyboardEvent){
   if(e.key==='Escape'){e.preventDefault();onClose();}
   if(e.key==='Tab'){
    const items=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button,a[href]')||[]);
    const first=items[0],last=items.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
   }
  }
  document.addEventListener('keydown',keydown);
  return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',keydown);previous?.focus();};
 },[]);
 return <div className="overlay install-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={dialog} className="modal about-modal install-modal" role="dialog" aria-modal="true" aria-labelledby="install-title">
  <button ref={close} className="close" onClick={onClose} aria-label={t("설치 방법 닫기")}><X size={22}/></button>
  <div className="install-heading"><img className="install-mascot" src={assetUrl('hachiware-favicon.png')} alt={t("바탕화면 치이 친구 아이콘")}/><h2 id="install-title">{t("바탕화면 치이 친구 받기")}</h2><p>{platform==='mac'?t("macOS 11 이상 · Apple Silicon / Intel"):'Windows 10 / 11 · Intel / AMD x64'}</p></div>
  <figure className="install-floating-preview"><div className={'install-desktop-scene desktop-'+platform} role="img" aria-label={t('창 없이 바탕화면에 떠 있는 치이 친구 예시')}><div className="install-desktop-menubar" aria-hidden="true"><span>{platform==='mac'?'● Finder':'⊞ Windows'}</span><span>🐾</span></div><img src={assetUrl('hachiware-favicon.png')} alt=""/><div className="install-desktop-dock" aria-hidden="true"><i/><i/><i/><i/><i/></div><span className="install-desktop-label">{t('바탕화면 예시')}</span></div><figcaption><strong>{t('내 바탕화면에, 작은 치이 친구 하나.')}</strong><p>{t('웹 창 안의 그림이 아니에요. 앱을 켜면 작은 치이 친구가 화면 위에 둥실 떠 있어요.')}</p><div><span>{t('창 없이 둥실둥실')}</span><span>{t('드래그로 자리 이동')}</span><span>{t('크기도 마음대로')}</span></div></figcaption></figure>
  <div className="install-platforms" role="tablist" aria-label={t("설치할 운영체제")} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'mac':e.key==='End'?'windows':platform==='mac'?'windows':'mac';setPlatform(next);(e.currentTarget.querySelectorAll<HTMLElement>('button')[next==='mac'?0:1])?.focus();}}}><button role="tab" tabIndex={platform==='mac'?0:-1} aria-selected={platform==='mac'} onClick={()=>setPlatform('mac')}>{t("맥")}</button><button role="tab" tabIndex={platform==='windows'?0:-1} aria-selected={platform==='windows'} onClick={()=>setPlatform('windows')}>{t("윈도우")}</button></div>
  <div className="install-download-options">{platform==='mac'?<a className="desktop-download" href="https://github.com/DELLA-SU/hachiware-collection/releases/download/v1.4.1/HachiwareDesktop-macOS.zip" onClick={()=>trackEvent('download_desktop','mac')}><Download size={17}/><span>{t("맥용 치이 친구 받기")}</span><ArrowUpRight size={17}/></a>:<a className="desktop-download" href="https://github.com/DELLA-SU/hachiware-collection/releases/download/v1.4.1/HachiwareDesktop-Windows-x64.zip" onClick={()=>trackEvent('download_desktop','windows_x64')}><Download size={17}/><span>{t("윈도우용 치이 친구 받기")}</span><ArrowUpRight size={17}/></a>}</div>
  <section className="install-click-guide" aria-label={t("바탕화면 치이 친구 사용 방법")}><h3>{t("바탕화면에서 이렇게 만나요")}</h3><p>{t('떠 있는 치이 친구를 한 번 또는 두 번 눌러 보세요.')}</p><div className="install-click-cards"><figure><div className="install-example"><img src={assetUrl('desktop-guide/photo-window.webp')} alt={t("치이 친구를 한 번 클릭하면 열리는 우사기 사진 창")} width="917" height="1000"/></div><figcaption><strong><span>1</span> {t("한 번 클릭 · 사진 창")}</strong><p>{t("랜덤 사진이 별도 창으로 열려요.")}<br/>{t("‘웹사이트 바로가기’로 도감에 담아요.")}</p></figcaption></figure><figure><div className="install-example"><img src={assetUrl('desktop-guide/music-tv.webp')} alt={t("치이 친구를 두 번 클릭하면 열리는 노래 TV 창")} width="960" height="662"/></div><figcaption><strong><span>2</span> {t("두 번 클릭 · 노래 TV")}</strong><p>{t("작은 TV 창에서")}<br/>{t("하치와레 노래를 들어요.")}</p></figcaption></figure></div></section>
  <section className="install-size-guide"><h3>{t('캐릭터 크기도 내 마음대로')}</h3><p>{platform==='mac'?t('치이 친구를 오른쪽 클릭하거나 메뉴 막대의 🐾 → 캐릭터 크기를 눌러요.'):t('치이 친구를 오른쪽 클릭하거나 작업 표시줄 아이콘 → 캐릭터 크기를 눌러요.')}</p><div><span>75% · {t('작게')}</span><span>100% · {t('기본')}</span><span>125% · {t('크게')}</span><span>150% · {t('아주 크게')}</span></div><small>{t('다시 켜도 선택한 크기가 유지돼요. 이전 버전이라면 새 앱을 받아 교체해 주세요.')}</small></section>
  <section className="install-power-guide"><h3>{t("치이 친구를 끄고 다시 켜려면?")}</h3><div><strong>{t("끄기")}</strong><p>{platform==='mac'?t("치이 친구를 오른쪽 클릭하거나 화면 맨 위 메뉴 막대의 🐾를 눌러 ‘종료’를 선택해요. 트랙패드는 두 손가락으로 클릭해요."):t("치이 친구를 오른쪽 클릭하고 ‘종료’를 선택해요. 작업 표시줄 오른쪽의 치이 친구 아이콘을 오른쪽 클릭해도 돼요.")}</p></div><div><strong>{t("다시 켜기")}</strong><p>{platform==='mac'?t("Finder → 응용 프로그램에서 ‘치이 친구.app’을 더블클릭해요. 옮겨 두지 않았다면 압축을 푼 폴더에서 실행해 주세요."):t("압축을 푼 폴더의 Hachiware.exe를 더블클릭해요. 자주 쓴다면 바로가기를 바탕화면에 만들어 두세요.")}</p></div><p className="install-power-note">{t("사진 창이나 TV 창의 닫기 버튼은 그 창만 닫아요. 바탕화면 치이 친구를 끄려면 ‘종료’를 선택해 주세요.")}</p></section>
  <h3 className="install-steps-title">{t("설치 방법")}</h3>
  {platform==='mac'?<><ol className="install-steps"><li><strong>{t("앱 다운로드")}</strong><p>{t("‘맥용 치이 친구 받기’를 눌러 ZIP 파일을 받아요.")}</p></li><li><strong>{t("압축 풀고 앱 옮기기")}</strong><p>{t("ZIP 파일을 더블클릭한 다음 ‘치이 친구.app’을 응용 프로그램 폴더로 옮겨 주세요.")}</p></li><li><strong>{t("치이 친구 실행")}</strong><p>{t("앱을 더블클릭하면 바탕화면에 치이 친구가 나타나요.")}</p></li></ol>
  <div className="install-warning"><h3>{t("처음 실행할 때 경고가 뜬다면?")}</h3><p>{t("현재 앱은 Apple 개발자 서명·공증을 받지 않아 확인 경고가 표시될 수 있어요.")}</p><p><strong>{t("“Apple에서 악성 소프트웨어가 있는지 확인할 수 없습니다”")}</strong> {t("또는")}<strong>{t("“개발자를 확인할 수 없습니다”")}</strong>{t("라는 경고라면, 공식 다운로드의 출처를 신뢰하고 실행하려는 경우 아래 순서를 직접 따라 주세요.")}</p><div className="install-path">{t("시스템 설정 → 개인정보 보호 및 보안")}<br/>{t("→ ‘그래도 열기’ → ‘열기’")}</div><p>{t("앱 실행을 한 번 시도한 후 설정을 열어 주세요. 허용하면 다음부터는 더블클릭으로 실행할 수 있어요.")}</p><a href="https://support.apple.com/ko-kr/102445" target="_blank" rel="noreferrer">{t("Apple 공식 안내")}<ArrowUpRight size={14}/></a></div>
  <p className="install-caution">{t("‘컴퓨터를 손상시킵니다’, ‘악성코드가 발견되었습니다’ 또는 ‘앱이 손상되었습니다’라는 경고는 다른 문제예요. 실행을 멈추고 경고창을 캡처해 문의해 주세요.")}</p>
  </>:<><ol className="install-steps"><li><strong>{t("윈도우용 앱 다운로드")}</strong><p>{t("Intel·AMD PC에서 ‘윈도우용 치이 친구 받기’를 눌러 ZIP 파일을 받아요.")}</p></li><li><strong>{t("압축을 모두 풀기")}</strong><p>{t("받은 ZIP 파일을 오른쪽 클릭하고 ‘모두 압축 풀기’를 선택하세요. 앱과 Assets 폴더를 함께 보관해 주세요.")}</p></li><li><strong>{t("Hachiware.exe 실행")}</strong><p>{t("압축을 푼 폴더에서 Hachiware.exe를 더블클릭해요. .NET은 앱에 포함되어 있어 별도로 설치하지 않아도 돼요.")}</p></li></ol><div className="install-warning"><h3>{t("첫 실행 때 Windows 경고가 뜬다면?")}</h3><p>{t("현재 앱에는 배포 인증서 서명이 없어 SmartScreen에서 ‘Windows의 PC 보호’ 경고가 표시될 수 있어요. 앱의 출처를 확인하고 실행하기로 했다면, 경고창의 ‘추가 정보’에서 게시자와 파일명을 확인한 뒤 ‘실행’을 직접 선택할 수 있어요.")}</p><p>{t("이 경고는 앱의 안전성을 보증하지 않아요. 백신이 악성코드나 위협을 탐지했다면 실행을 멈춰 주세요. 회사·학교 PC는 관리 정책에 따라 실행이 제한될 수 있어요.")}</p></div><div className="install-warning windows-tv-help"><h3>{t("노래 TV 창이 열리지 않을 때")}</h3><p>{t("TV 창에는 Microsoft WebView2 Runtime이 필요해요. 앱이 런타임을 찾지 못하면 브라우저에서 노래를 열거나 Microsoft 공식 설치 페이지를 안내해요. 노래 재생에는 인터넷 연결이 필요해요.")}</p><a href="https://developer.microsoft.com/microsoft-edge/webview2/" target="_blank" rel="noreferrer">{t("Microsoft WebView2 공식 다운로드")}<ArrowUpRight size={14}/></a></div></>}

  <button className="about-done" onClick={onClose}>{t("닫기")}</button>
 </section></div>;
}
