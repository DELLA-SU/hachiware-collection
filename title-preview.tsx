import React from 'react';
import {createRoot} from 'react-dom/client';
import TitlePreview from './app/title-preview';
import './app/globals.css';
import './app/theme.css';
createRoot(document.getElementById('root')!).render(<TitlePreview/>);
