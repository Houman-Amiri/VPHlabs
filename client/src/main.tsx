import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './styles/index.css';
import { initClientSentry, Sentry } from './lib/sentry';
import { initUmamiAnalytics } from './lib/analytics';
import App from './App';

initClientSentry();
initUmamiAnalytics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>خطایی در نمایش صفحه رخ داد</h2>
          <p>لطفاً صفحه را بازنشانی (Refresh) نمایید.</p>
        </div>
      }
    >
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
