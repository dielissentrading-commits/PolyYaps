/**
 * Service worker registration.
 *
 * Only in production builds: in development the worker would serve stale
 * modules and make changes look like they did not apply.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // An unavailable worker only costs offline support, never the app.
    });
  });
}
