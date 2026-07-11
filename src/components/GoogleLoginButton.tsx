import { useEffect, useRef } from 'react';
import { ENV } from '../config/env';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar el script de Google.'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

interface GoogleLoginButtonProps {
  onCredential: (idToken: string) => void;
}

/**
 * Botón "Continuar con Google" — solo se renderiza si hay un client ID
 * configurado (VITE_GOOGLE_CLIENT_ID). Sin eso, no tiene sentido mostrar
 * un botón que va a fallar al tocarlo, así que directamente no aparece
 * (mismo criterio que el pago con tarjeta cuando falta Openpay).
 */
export function GoogleLoginButton({ onCredential }: GoogleLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ENV.GOOGLE_CLIENT_ID || !containerRef.current) return;

    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google || !containerRef.current) return;
        window.google.accounts.id.initialize({
          client_id: ENV.GOOGLE_CLIENT_ID,
          callback: (response) => onCredential(response.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: 320,
          shape: 'pill',
          text: 'continue_with',
        });
      })
      .catch(() => {
        // Sin conexión al script de Google — el botón simplemente no aparece.
      });

    return () => {
      cancelled = true;
    };
  }, [onCredential]);

  if (!ENV.GOOGLE_CLIENT_ID) return null;

  return <div ref={containerRef} className="google-login-button" />;
}
