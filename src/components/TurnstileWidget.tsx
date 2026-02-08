import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpired?: () => void;
}

export function TurnstileWidget({ onVerify, onError, onExpired }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch the site key from the edge function
  useEffect(() => {
    async function fetchSiteKey() {
      try {
        const { data, error } = await supabase.functions.invoke('get-turnstile-key');
        if (error) throw error;
        if (data?.siteKey) {
          setSiteKey(data.siteKey);
        } else {
          throw new Error('No site key returned');
        }
      } catch (err) {
        console.error('Failed to fetch Turnstile site key:', err);
        setError('CAPTCHA configuration error');
        onError?.();
      }
    }
    fetchSiteKey();
  }, [onError]);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;

    // Remove existing widget if any
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch (e) {
        // Widget might already be removed
      }
    }

    // Clear container
    containerRef.current.innerHTML = '';

    // Render new widget
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'error-callback': onError,
      'expired-callback': onExpired,
      theme: 'auto',
      size: 'normal',
    });
  }, [siteKey, onVerify, onError, onExpired]);

  useEffect(() => {
    if (!siteKey) return;

    // Check if script is already loaded
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Check if script is being loaded
    if (scriptLoadedRef.current) return;

    // Load Turnstile script
    scriptLoadedRef.current = true;
    
    window.onTurnstileLoad = () => {
      renderWidget();
    };

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Widget might already be removed
        }
      }
    };
  }, [siteKey, renderWidget]);

  if (error) {
    return (
      <div className="flex justify-center my-4 text-destructive text-sm">
        {error}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center my-4"
      aria-label="CAPTCHA verification"
    />
  );
}

export function resetTurnstile() {
  // This function can be called to reset the widget if needed
}
