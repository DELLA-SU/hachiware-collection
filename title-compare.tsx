import React from 'react';
import {createRoot} from 'react-dom/client';
import TitleCompare from './app/title-compare';
import './app/globals.css';
import './app/theme.css';
createRoot(document.getElementById('root')!).render(<TitleCompare/>);
