// The status-bar progress bar of a page load; fills over the load's (scaled) duration.
import { useEffect, useState } from 'react';

export function LoadProgress({ ms }: { ms: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => {
      setValue(Math.min(100, ((Date.now() - started) / Math.max(ms, 1)) * 100));
    }, 50);
    return () => clearInterval(timer);
  }, [ms]);
  return (
    <progress max={100} value={Math.round(value)} aria-label="Page loading" />
  );
}
