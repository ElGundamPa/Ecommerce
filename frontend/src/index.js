import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';
import { ToastProvider } from './components/ui/Toast';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { queryClient } from './lib/queryClient';
import ErrorBoundary from './components/ErrorBoundary';

// Desactivar Devtools para evitar error de módulo faltante
const ReactQueryDevtools = () => null;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AccessibilityProvider>
              <CartProvider>
                <ToastProvider>
                  <App />
                </ToastProvider>
              </CartProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </BrowserRouter>
        {/* Devtools desactivados */}
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Service Worker
if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  } else {
    // En desarrollo, asegurarnos de desregistrar cualquier SW previo para evitar pantallas en blanco por caché
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    caches && caches.keys && caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
}
