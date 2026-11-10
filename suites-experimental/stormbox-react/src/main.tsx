import { createRoot } from 'react-dom/client';

import { App } from './App';
import { ANIMATIONS_OFF } from './motion';
import './styles/services-ui.css';
import './styles/styles.css';
import './styles/app.css';
import './styles/components.css';
import './styles/local.css';

if (ANIMATIONS_OFF) document.documentElement.classList.add('no-motion');

createRoot(document.getElementById('app')!).render(<App />);
