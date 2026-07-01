// Prevent crashes in sandboxed environments (like iframes) if libraries attempt to override or write to window.fetch
try {
  const originalFetch = window.fetch;
  let customFetch = originalFetch;
  Object.defineProperty(window, 'fetch', {
    get() {
      return customFetch || originalFetch;
    },
    set(v) {
      customFetch = v;
    },
    configurable: true,
    enumerable: true
  });
} catch (e) {
  console.warn("Could not redefine window.fetch setter/getter:", e);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'katex/dist/katex.min.css';
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from '@/src/context/AuthContext';
import { ToastProvider } from '@/src/context/ToastContext';

// Expose version to console
const PAPYRUS_VERSION = '1.0.0';
(window as any).PAPYRUS_VERSION = PAPYRUS_VERSION;
console.log(`%c📚 Papyrus v${PAPYRUS_VERSION}`, 'font-size: 14px; font-weight: bold; color: #8c6d4f;');
console.log('Check version with: window.PAPYRUS_VERSION');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </TooltipProvider>
  </StrictMode>,
);
