import { getBaseUrl } from './lib/basePath';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@tabler/icons-webfont/dist/tabler-icons.min.css';
import './index.css';

// Register service worker
import { registerSW } from 'virtual:pwa-register';

if (!import.meta.env.DEV) {
  registerSW({ immediate: true });
}

const basename = getBaseUrl() === '/' ? '' : '/digital/simulasisains';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// Register game service worker for local offline playing
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(
    `${getBaseUrl()}game-sw.js`,
    {
      scope: `${getBaseUrl()}`
    }
  )
  .then(reg => console.log('Game SW registered with scope:', reg.scope))
  .catch(err => console.warn('Game SW registration notice:', err));
}
