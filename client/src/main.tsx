import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './index.css';

// Expose a global function to hide the splash screen
// Pages call this when their data is ready
(window as any).__hideSplash = () => {
  const splash = document.getElementById('app-splash');
  if (!splash) return;
  splash.classList.add('hide');
  setTimeout(() => splash.remove(), 600);
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
