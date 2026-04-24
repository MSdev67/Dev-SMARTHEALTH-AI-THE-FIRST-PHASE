import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './lib/AuthProvider';
import { LanguageProvider } from './lib/LanguageProvider';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <App />
        <Toaster position="top-center" richColors />
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
);
