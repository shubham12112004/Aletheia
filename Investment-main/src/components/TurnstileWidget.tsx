import { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);
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
                setErrorMessage('Verification failed. Please try again.');
                onError('Cloudflare verification could not be completed. Please retry.');
              },
            });
            setIsLoading(false);
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
          setIsLoading(false);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[65px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-3">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
        <span className="ml-2 text-sm text-zinc-400">Loading security verification...</span>
      </div>
    );
  }

  // Error state with fallback
  if (hasError && !isExpired) {
    return (
      <div className="space-y-3">
        <div className="flex items-start rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
          <div className="ml-3">
            <p className="text-sm font-medium text-rose-400">{errorMessage}</p>
            <p className="mt-1 text-xs text-rose-300">The security verification service is temporarily unavailable. Please try again or contact support if the problem persists.</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Verification
        </button>
      </div>
    );
  }

  // Token expired state
  if (isExpired) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <p className="text-sm font-medium text-amber-400">Verification Expired</p>
          <p className="mt-1 text-xs text-amber-300">Your security verification has expired. Please refresh to continue.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Verification
        </button>
      </div>
    );
  }

  // Normal widget render
  return <div ref={containerRef} className="flex min-h-[65px] justify-center" aria-label="Cloudflare Turnstile security verification" />;
}
