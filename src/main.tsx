import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import '@tabler/icons-webfont/dist/tabler-icons.min.css';
import './index.css';

// Minimalize memory footprint on potato devices by silencing noisy console logs
if (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') {
  const noop = () => {};
  window.console.log = noop;
  window.console.debug = noop;
  window.console.info = noop;
}

// Register service worker
import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
