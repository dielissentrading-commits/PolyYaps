import { useEffect, useState } from 'react';

/**
 * Access to the browser's install prompt.
 *
 * Chromium fires `beforeinstallprompt` and lets the page trigger it later;
 * iOS Safari does not, so there the app has to explain the Share-sheet route
 * instead. `canPrompt` distinguishes the two.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallState {
  /** True when the app is already running as an installed app. */
  installed: boolean;
  /** True when the browser offers a prompt this page can trigger. */
  canPrompt: boolean;
  /** True on iOS, where installing goes through the Share sheet. */
  needsManualInstall: boolean;
  install: () => Promise<boolean>;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari reports installed apps here rather than through display-mode.
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function useInstallPrompt(): InstallState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  return {
    installed,
    canPrompt: deferred !== null,
    needsManualInstall: !installed && deferred === null && isIOS(),
    install: async () => {
      if (!deferred) return false;
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      setDeferred(null);
      return outcome === 'accepted';
    },
  };
}
