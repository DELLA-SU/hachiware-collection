import {assetUrl} from './asset-url';
import {t,useLanguage} from './locale';
import './coupang-banner.css';

export default function CoupangBanner(){
 useLanguage();
 return <aside className="coupang-partners" aria-labelledby="coupang-partners-title">
  <header className="coupang-partners-heading">
   <h2 id="coupang-partners-title">{t('광고 · 쿠팡 파트너스')}</h2>
   <a href={assetUrl('privacy.html#coupang')}>{t('개인정보 안내')}</a>
  </header>
  <p className="coupang-partners-disclosure">{t('이 배너는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.')}</p>
  <div className="coupang-partners-banner">
   <a className="coupang-partners-wide" href="https://link.coupang.com/a/intlsqwkVM" target="_blank" rel="sponsored noopener" referrerPolicy="unsafe-url" aria-label={t('쿠팡 완구·취미 광고, 새 창에서 열기')}>
    <img src="https://ads-partners.coupang.com/banners/1046275?trackingCode=AF9897686&subId=&traceId=V0-301-8be2627c04ed5569-I1046275&w=728&h=90" width="728" height="90" loading="lazy" decoding="async" alt={t('쿠팡 완구·취미 광고')}/>
   </a>
   <a className="coupang-partners-compact" href="https://link.coupang.com/a/into5WXpAG" target="_blank" rel="sponsored noopener" referrerPolicy="unsafe-url" aria-label={t('쿠팡 완구·취미 광고, 새 창에서 열기')}>
    <img src="https://ads-partners.coupang.com/banners/1046276?trackingCode=AF9897686&subId=&traceId=V0-301-8be2627c04ed5569-I1046276&w=320&h=100" width="320" height="100" loading="lazy" decoding="async" alt={t('쿠팡 완구·취미 광고')}/>
   </a>
  </div>
 </aside>;
}
