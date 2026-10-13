import {trackEvent} from './analytics';
import {useEffect,useRef,useState} from 'react';
import {BookOpen,Download,X,ArrowUpRight} from 'lucide-react';

export default function InstallGuide({onClose}:{onClose:()=>void}){
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
 return <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={dialog} className="modal about-modal install-modal" role="dialog" aria-modal="true" aria-labelledby="install-title">
  <button ref={close} className="close" onClick={onClose} aria-label="설치 방법 닫기"><X size={22}/></button>
  <div className="install-heading"><BookOpen size={28}/><h2 id="install-title">바탕화면 하치와레 받기</h2><p>{platform==='mac'?'macOS 11 이상 · Apple Silicon / Intel':'Windows 10 / 11 x64 · Windows 11 ARM64'}</p></div>
  <div className="install-platforms" role="tablist" aria-label="설치할 운영체제" onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'mac':e.key==='End'?'windows':platform==='mac'?'windows':'mac';setPlatform(next);(e.currentTarget.querySelectorAll<HTMLElement>('button')[next==='mac'?0:1])?.focus();}}}><button role="tab" tabIndex={platform==='mac'?0:-1} aria-selected={platform==='mac'} onClick={()=>setPlatform('mac')}>맥</button><button role="tab" tabIndex={platform==='windows'?0:-1} aria-selected={platform==='windows'} onClick={()=>setPlatform('windows')}>윈도우</button></div>
  <div className="install-download-options">{platform==='mac'?<a className="desktop-download" href="https://github.com/DELLA-SU/hachiware-collection/releases/download/v1.3.1/HachiwareDesktop-macOS.zip" onClick={()=>trackEvent('download_desktop','mac')}><Download size={17}/><span>맥용 하치와레 받기</span><ArrowUpRight size={17}/></a>:<><a className="desktop-download" href="https://github.com/DELLA-SU/hachiware-collection/releases/download/v1.3.1/HachiwareDesktop-Windows-x64.zip" onClick={()=>trackEvent('download_desktop','windows_x64')}><Download size={17}/><span>윈도우용 하치와레 받기</span><ArrowUpRight size={17}/></a><a className="windows-arm-download" href="https://github.com/DELLA-SU/hachiware-collection/releases/download/v1.3.1/HachiwareDesktop-Windows-ARM64.zip" onClick={()=>trackEvent('download_desktop','windows_arm64')}>Windows ARM64용 받기 <ArrowUpRight size={12}/></a></>}</div>
  <p className="install-sync-note">바탕화면 하치와레를 한 번 클릭하면 사진 창이 열려요. 사진 창의 ‘웹사이트 바로가기’를 누르면 같은 사진이 기본 브라우저의 내 도감에 저장돼요. 두 번 클릭하면 노래 TV 창이 열려요.</p><h3 className="install-steps-title">설치 방법</h3>
  {platform==='mac'?<><ol className="install-steps"><li><strong>앱 다운로드</strong><p>‘맥용 하치와레 받기’를 눌러 ZIP 파일을 받아요.</p></li><li><strong>압축 풀고 앱 옮기기</strong><p>ZIP 파일을 더블클릭한 다음 ‘하치와레.app’을 응용 프로그램 폴더로 옮겨 주세요.</p></li><li><strong>하치와레 실행</strong><p>앱을 더블클릭하면 바탕화면에 하치와레가 나타나요.</p></li></ol>
  <div className="install-warning"><h3>처음 실행할 때 경고가 뜬다면?</h3><p>현재 앱은 Apple 개발자 서명·공증을 받지 않아 확인 경고가 표시될 수 있어요.</p><p><strong>“Apple에서 악성 소프트웨어가 있는지 확인할 수 없습니다”</strong> 또는 <strong>“개발자를 확인할 수 없습니다”</strong>라는 경고라면, 공식 다운로드의 출처를 신뢰하고 실행하려는 경우 아래 순서를 직접 따라 주세요.</p><div className="install-path">시스템 설정 → 개인정보 보호 및 보안<br/>→ ‘그래도 열기’ → ‘열기’</div><p>앱 실행을 한 번 시도한 후 설정을 열어 주세요. 허용하면 다음부터는 더블클릭으로 실행할 수 있어요.</p><a href="https://support.apple.com/ko-kr/102445" target="_blank" rel="noreferrer">Apple 공식 안내 <ArrowUpRight size={14}/></a></div>
  <p className="install-caution">‘컴퓨터를 손상시킵니다’, ‘악성코드가 발견되었습니다’ 또는 ‘앱이 손상되었습니다’라는 경고는 다른 문제예요. 실행을 멈추고 경고창을 캡처해 문의해 주세요.</p>
  </>:<><ol className="install-steps"><li><strong>윈도우용 앱 다운로드</strong><p>일반 Intel·AMD PC는 ‘윈도우용 하치와레 받기’를 눌러 주세요. Snapdragon 등 ARM PC는 ‘Windows ARM64용 받기’를 선택해요.</p></li><li><strong>압축을 모두 풀기</strong><p>받은 ZIP 파일을 오른쪽 클릭하고 ‘모두 압축 풀기’를 선택하세요. 앱과 Assets 폴더를 함께 보관해 주세요.</p></li><li><strong>Hachiware.exe 실행</strong><p>압축을 푼 폴더에서 Hachiware.exe를 더블클릭해요. .NET은 앱에 포함되어 있어 별도로 설치하지 않아도 돼요.</p></li></ol><div className="install-warning"><h3>첫 실행 때 Windows 경고가 뜬다면?</h3><p>현재 앱에는 배포 인증서 서명이 없어 SmartScreen에서 ‘Windows의 PC 보호’ 경고가 표시될 수 있어요. 앱의 출처를 확인하고 실행하기로 했다면, 경고창의 ‘추가 정보’에서 게시자와 파일명을 확인한 뒤 ‘실행’을 직접 선택할 수 있어요.</p><p>이 경고는 앱의 안전성을 보증하지 않아요. 백신이 악성코드나 위협을 탐지했다면 실행을 멈춰 주세요. 회사·학교 PC는 관리 정책에 따라 실행이 제한될 수 있어요.</p></div><div className="install-warning windows-tv-help"><h3>노래 TV 창이 열리지 않을 때</h3><p>TV 창에는 Microsoft WebView2 Runtime이 필요해요. 앱이 런타임을 찾지 못하면 브라우저에서 노래를 열거나 Microsoft 공식 설치 페이지를 안내해요. 노래 재생에는 인터넷 연결이 필요해요.</p><a href="https://developer.microsoft.com/microsoft-edge/webview2/" target="_blank" rel="noreferrer">Microsoft WebView2 공식 다운로드 <ArrowUpRight size={14}/></a></div></>}
  <button className="about-done" onClick={onClose}>닫기</button>
 </section></div>;
}
