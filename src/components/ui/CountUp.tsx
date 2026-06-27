import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  format?: (n: number) => string;
}

export default function CountUp({
  value,
  duration = 1000,
  decimals = 0,
  className,
  format,
}: Props) {
  const [display, setDisplay] = useState(0);
  const from = useRef(0);
  const raf = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const startVal = from.current;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = startVal + (value - startVal) * eased;
      setDisplay(v);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      from.current = value;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const out = format
    ? format(display)
    : display.toLocaleString("fr-FR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return <span className={className}>{out}</span>;
}
