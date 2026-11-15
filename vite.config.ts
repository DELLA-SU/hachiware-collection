import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
const fonts='https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Noto+Sans+KR:wght@400;500;600;700;800;900&family=Jua&family=Noto+Serif+KR:wght@700&family=DM+Serif+Display:ital@0;1&display=swap';
export default defineConfig({
 base:'/hachiware-collection/',
 plugins:[react(),{name:'early-font-discovery',transformIndexHtml(html,ctx){const stylesheet=/(?:pajama|certificates)\.html$/.test(ctx.filename)?'https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;500;600;700;800;900&display=swap':fonts;return [
  {tag:'link',attrs:{rel:'preconnect',href:'https://fonts.googleapis.com'},injectTo:'head-prepend'},
  {tag:'link',attrs:{rel:'preconnect',href:'https://fonts.gstatic.com',crossorigin:''},injectTo:'head-prepend'},
  {tag:'link',attrs:{rel:'stylesheet',href:stylesheet},injectTo:'head'}
 ];}}],
 build:{outDir:'docs',emptyOutDir:true,rollupOptions:{input:{main:'index.html',gacha:'gacha-preview.html',colors:'gacha-colors-preview.html',strawberry:'strawberry-colors-preview.html',naming:'naming-preview.html',entrance:'entrance-preview.html',capsule:'capsule-preview.html',certificates:'certificates.html',pajama:'pajama.html',typography:'title-preview.html',typeCompare:'title-compare.html'}}}
});
