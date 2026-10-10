import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';
export default defineConfig({base:'/hachiware-collection/',plugins:[react()],build:{outDir:'docs',emptyOutDir:true}});
