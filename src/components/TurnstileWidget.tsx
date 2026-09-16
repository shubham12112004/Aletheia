import { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      ready?: (callback: () => void) => void;
      render: (container: HTMLElement | string, options: any) => string;
      remove: (widgetId?: string) => void;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  const handleRefresh = () => {
    if (widgetIdRef.current && window.turnstile) {
      setIsExpired(false);
      setHasError(false);
      window.turnstile.reset(widgetIdRef.current);
      onToken('');
    }
  };

  useEffect(() => {
    let active = true;
    setHasError(false);

    void loadTurnstileScript()
      .then(() => {
        const turnstile = window.turnstile;
        if (!active || !containerRef.current || !turnstile) return;

        const renderWidget = () => {
          if (!active || !containerRef.current) return;
          try {
            widgetIdRef.current = turnstile.render(containerRef.current, {
              sitekey: siteKey,
              theme: 'dark',
              size: 'normal',
              action: 'login',
              callback: (token: string) => {
                onToken(token);
                setIsExpired(false);
                setHasError(false);
              },
              'expired-callback': () => {
                setIsExpired(true);
                onToken('');
              },
              'error-callback': () => {
                setHasError(true);
                setErrorMessage('Verification failed.');
                onError('Cloudflare verification could not be completed. Please retry.');
              },
            });
          } catch (err) {
            setHasError(true);
            setErrorMessage('Failed to render verification widget.');
            onError('Failed to render verification widget.');
          }
        };

        if (turnstile.ready) turnstile.ready(renderWidget);
        else renderWidget();
      })
      .catch((error: Error) => {
        if (active) {
          setHasError(true);
          setErrorMessage(error.message || 'Verification service unavailable');
          onError(error.message);
        }
      });

    return () => {
      active = false;
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
    };
  }, [onError, onToken, siteKey]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[65px] w-full">
      <div ref={containerRef} aria-label="Cloudflare Turnstile security verification" />
      
      {hasError && !isExpired && (
        <div className="mt-2 flex items-center gap-2 text-xs text-rose-400">
          <AlertCircle className="h-3 w-3" />
          <span>{errorMessage}</span>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-rose-400 hover:bg-rose-500/20"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}
      
      {isExpired && (
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
          <AlertCircle className="h-3 w-3" />
          <span>Verification Expired</span>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-amber-400 hover:bg-amber-500/20"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      )}
    </div>
  );
}
