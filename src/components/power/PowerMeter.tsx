import { useEffect, useState } from 'react';
import { useSpring } from 'framer-motion';
import { formatKwh } from '../../utils/formatters';

interface PowerMeterProps {
  totalWatts: number;
  estimatedKwh: number;
  isLoading?: boolean;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const spring = useSpring(value, { stiffness: 80, damping: 20, mass: 1 });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [spring]);

  return <span>{displayValue}</span>;
}

export function PowerMeter({ totalWatts, estimatedKwh, isLoading }: PowerMeterProps) {
  if (isLoading) {
    return (
      <div className="p-6 bg-surface rounded-lg border border-border">
        <p className="text-xs font-medium text-text-muted tracking-wide uppercase mb-3">
          Live Office Power
        </p>
        <div className="h-16 w-48 bg-border rounded animate-pulse mb-3" />
        <div className="h-4 w-24 bg-border rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-surface rounded-lg border border-border">
      <p className="text-xs font-medium text-text-muted tracking-wide uppercase mb-3">
        Live Office Power
      </p>

      <div className="flex items-baseline gap-2">
        <span className="font-mono text-8xl font-bold text-text-primary leading-none tracking-tighter">
          <AnimatedNumber value={totalWatts} />
        </span>
        <span className="text-lg font-mono text-text-muted font-medium">W</span>
      </div>

      <p className="mt-4 text-xs text-text-muted">
        Today{' '}
        <span className="font-mono text-text-primary">{formatKwh(estimatedKwh)}</span>
      </p>
    </div>
  );
}
