import { useEffect, useState } from 'react';

export default function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <div className="live-clock" aria-label={'Current time ' + now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}>
    <span className="live-clock-dot" /><span><strong>{now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
      <small>{now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · IST</small></span>
  </div>;
}
