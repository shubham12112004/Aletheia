import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      ready?: (callback: () => void) => void;
      render: (container: HTMLElement | string, options: any) => string;
      remove: (widgetId?: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  siteKey: string;
  onToken: (token: string) => void;
  onError: (message: string) => void;
};

function waitForTurnstile() {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.clearInterval(poll);
      reject(new Error('Cloudflare Turnstile did not finish loading.'));
    }, 12_000);
    const poll = window.setInterval(() => {
      if (!window.turnstile) return;
      window.clearInterval(poll);
      window.clearTimeout(timeout);
      resolve();
    }, 50);
  });
}

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
  );
  if (existing) return waitForTurnstile();

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = 'true';
    script.onload = () => void waitForTurnstile().then(resolve, reject);
    script.onerror = () => reject(new Error('Cloudflare Turnstile could not load. Check your network or content blocker.'));
    document.head.appendChild(script);
  });
}
export function TurnstileWidget({ siteKey, onToken, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    void loadTurnstileScript()
      .then(() => {
        const turnstile = window.turnstile;
        if (!active || !containerRef.current || !turnstile) return;

        const renderWidget = () => {
          if (!active || !containerRef.current) return;
          widgetIdRef.current = turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: 'light',
            size: 'normal',
            action: 'login',
            callback: (token: string) => onToken(token),
            'expired-callback': () => onToken(''),
            'error-callback': () => onError('Cloudflare verification could not be completed. Please retry.'),
          });
        };

        if (turnstile.ready) turnstile.ready(renderWidget);
        else renderWidget();
      })
      .catch((error: Error) => onError(error.message));

    return () => {
      active = false;
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
    };
  }, [onError, onToken, siteKey]);

  return <div ref={containerRef} className="flex min-h-[65px] justify-center" aria-label="Cloudflare security verification" />;
}