import { useEffect, useRef, useCallback } from 'react';

// Turnstile site key - this is your public site key from Cloudflare
// For testing, you can use Cloudflare's test keys:
// - Always passes: 1x00000000000000000000AA
// - Always blocks: 2x00000000000000000000AB
// - Forces interactive challenge: 3x00000000000000000000FF
const TURNSTILE_SITE_KEY = '1x00000000000000000000AA'; // Test key - always passes

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

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;

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
      sitekey: TURNSTILE_SITE_KEY,
      callback: onVerify,
      'error-callback': onError,
      'expired-callback': onExpired,
      theme: 'auto',
      size: 'normal',
    });
  }, [onVerify, onError, onExpired]);

  useEffect(() => {
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
  }, [renderWidget]);

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
  // For now, we'll just reload by triggering a re-render
}
