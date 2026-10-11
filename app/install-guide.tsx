import {useEffect,useRef} from 'react';
import {BookOpen,Download,X,ArrowUpRight} from 'lucide-react';

export default function InstallGuide({onClose}:{onClose:()=>void}){
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
  <div className="install-heading"><BookOpen size={28}/><h2 id="install-title">하치와레 설치 방법</h2><p>macOS 11 이상 · Apple Silicon / Intel</p></div>
  <ol className="install-steps"><li><strong>앱 다운로드</strong><p>‘바탕화면 하치와레 받기’를 눌러 ZIP 파일을 받아요.</p></li><li><strong>압축 풀고 앱 옮기기</strong><p>ZIP 파일을 더블클릭한 다음 ‘하치왕왕.app’을 응용 프로그램 폴더로 옮겨 주세요.</p></li><li><strong>하치왕왕 실행</strong><p>앱을 더블클릭하면 바탕화면에 하치와레가 나타나요.</p></li></ol>
  <div className="install-warning"><h3>처음 실행할 때 경고가 뜬다면?</h3><p>현재 앱은 Apple 개발자 서명·공증을 받지 않아 확인 경고가 표시될 수 있어요.</p><p><strong>“Apple에서 악성 소프트웨어가 있는지 확인할 수 없습니다”</strong> 또는 <strong>“개발자를 확인할 수 없습니다”</strong>라는 경고라면, 공식 다운로드의 출처를 신뢰하고 실행하려는 경우 아래 순서를 직접 따라 주세요.</p><div className="install-path">시스템 설정 → 개인정보 보호 및 보안<br/>→ ‘그래도 열기’ → ‘열기’</div><p>앱 실행을 한 번 시도한 후 설정을 열어 주세요. 허용하면 다음부터는 더블클릭으로 실행할 수 있어요.</p><a href="https://support.apple.com/ko-kr/102445" target="_blank" rel="noreferrer">Apple 공식 안내 <ArrowUpRight size={14}/></a></div>
  <p className="install-caution">‘컴퓨터를 손상시킵니다’, ‘악성코드가 발견되었습니다’ 또는 ‘앱이 손상되었습니다’라는 경고는 다른 문제예요. 실행을 멈추고 경고창을 캡처해 문의해 주세요.</p>
  <button className="about-done" onClick={onClose}>확인했어요 <Download size={17}/></button>
 </section></div>;
}
