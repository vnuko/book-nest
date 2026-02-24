import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib';
import { ErrorBoundary } from './components/common';
import './styles/global.css';
import './styles/utilities.css';
import App from './App';

const rootElement = document.getElementById('root')!;
const initialLoader = document.getElementById('initial-loader');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);

if (initialLoader) {
  requestAnimationFrame(() => {
    initialLoader.classList.add('hidden');
    setTimeout(() => initialLoader.remove(), 300);
  });
}
