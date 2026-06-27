import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './index.css';

// Track when the splash was first shown
const splashStart = Date.now();
const SPLASH_MIN_MS = 3000; // 3 seconds minimum

// Expose a global function to hide the splash screen
// Pages call this when their data is ready
(window as any).__hideSplash = () => {
  const splash = document.getElementById('app-splash');
  if (!splash) return;
  const elapsed = Date.now() - splashStart;
  const remaining = Math.max(0, SPLASH_MIN_MS - elapsed);
  setTimeout(() => {
    splash.classList.add('hide');
    setTimeout(() => splash.remove(), 600);
  }, remaining);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
