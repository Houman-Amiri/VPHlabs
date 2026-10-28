declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
    };
  }
}

let initialized = false;

/**
 * Phase 7.4: Injects privacy-friendly Umami analytics script when configured
 * via `VITE_UMAMI_WEBSITE_ID` and exposes `trackEvent` for live UI interactions.
 */
export function initUmamiAnalytics() {
  if (initialized || typeof document === 'undefined') return;
  initialized = true;

  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  const scriptSrc =
    import.meta.env.VITE_UMAMI_SRC || 'https://cloud.umami.is/script.js';

  if (!websiteId) return;

  const existing = document.querySelector('script[data-umami-vph="true"]');
  if (existing) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = scriptSrc;
  script.setAttribute('data-website-id', websiteId);
  script.setAttribute('data-umami-vph', 'true');
  document.head.appendChild(script);
}

export function trackEvent(
  eventName: string,
  payload?: Record<string, string | number | boolean>
) {
  try {
    if (typeof window !== 'undefined' && window.umami?.track) {
      window.umami.track(eventName, payload);
    }
  } catch {
    // Analytics must never interrupt user flow
  }
}
