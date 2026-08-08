import { useEffect, useState } from 'react';
import type { LandingBlock } from '../../types/landing';

function getRemaining(targetDate: string) {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return { days, hours, minutes };
}

export function CountdownBlock({ block }: { block: LandingBlock }) {
  const { targetDate, label } = block.content;
  const { align = 'center' } = block.style ?? {};
  const [remaining, setRemaining] = useState(() => (targetDate ? getRemaining(targetDate) : null));

  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setRemaining(getRemaining(targetDate)), 60_000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!remaining) return null;

  return (
    <div className="lb-countdown" style={{ justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }}>
      {label && <span className="lb-countdown__label">{label}</span>}
      <div className="lb-countdown__unit"><div className="lb-countdown__num">{remaining.days}</div><div className="lb-countdown__unitlabel">DÍAS</div></div>
      <div className="lb-countdown__unit"><div className="lb-countdown__num">{remaining.hours}</div><div className="lb-countdown__unitlabel">HS</div></div>
      <div className="lb-countdown__unit"><div className="lb-countdown__num">{remaining.minutes}</div><div className="lb-countdown__unitlabel">MIN</div></div>
    </div>
  );
}
