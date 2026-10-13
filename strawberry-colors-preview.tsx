import React from 'react';
import {createRoot} from 'react-dom/client';
import StrawberryColorsPreview from './app/strawberry-colors-preview';
import './app/globals.css';
import './app/theme.css';
createRoot(document.getElementById('root')!).render(<StrawberryColorsPreview/>);
