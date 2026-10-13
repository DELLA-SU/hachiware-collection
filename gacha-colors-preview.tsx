import React from 'react';
import {createRoot} from 'react-dom/client';
import GachaColorsPreview from './app/gacha-colors-preview';
import './app/globals.css';
import './app/theme.css';
createRoot(document.getElementById('root')!).render(<GachaColorsPreview/>);
