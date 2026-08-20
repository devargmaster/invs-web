import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './QRScanner.css';

interface QRScannerProps {
  onScan: (data: string) => void;
  active: boolean;
}

export function QRScanner({ onScan, active }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const hasScanned = useRef(false);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    hasScanned.current = false;
    const scannerId = 'qr-scanner-view';

    // Ensure element exists
    let el = document.getElementById(scannerId);
    if (!el && containerRef.current) {
      el = document.createElement('div');
      el.id = scannerId;
      containerRef.current.appendChild(el);
    }

    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        if (hasScanned.current) return;
        hasScanned.current = true;
        scanner.stop().catch(() => {});
        onScan(decodedText);
      },
      () => {},
    ).catch((err) => {
      setError(
        typeof err === 'string'
          ? err
          : 'No se pudo acceder a la cámara. Verificá los permisos del navegador.'
      );
    });

    return () => {
      scanner.stop().catch(() => {});
      scannerRef.current = null;
    };
  }, [active, onScan]);

  if (error) {
    return (
      <div className="qr-scanner__error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
          <rect x="2" y="2" width="20" height="20" rx="4" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="qr-scanner" ref={containerRef}>
      {active && <div className="qr-scanner__overlay"><div className="qr-scanner__frame"></div></div>}
    </div>
  );
}
