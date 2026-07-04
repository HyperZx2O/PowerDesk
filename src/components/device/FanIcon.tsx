import { motion } from 'framer-motion';

interface FanIconProps {
  isOn: boolean;
  size?: number;
  speed?: 'slow' | 'normal' | 'fast';
}

const speedDurations = {
  slow: 2,
  normal: 1.5,
  fast: 1,
};

export function FanIcon({ isOn, size = 24, speed = 'normal' }: FanIconProps) {
  const duration = speedDurations[speed];
  const opacity = isOn ? 1 : 0.4;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ opacity, transition: 'opacity 300ms ease' }}
    >
      <motion.g
        animate={isOn ? { rotate: 360 } : { rotate: 0 }}
        transition={{
          duration,
          repeat: isOn ? Infinity : 0,
          ease: 'linear',
        }}
        style={{ transformOrigin: '12px 12px' }}
      >
        {/* Y-silhouette — 3 blades at 120° intervals */}
        <path
          d="M12 12 C12 10.5, 11.5 6, 12 3 C12.5 6, 13 10.5, 12 12"
          fill="var(--color-fan-on)"
          opacity={isOn ? 1 : 0.5}
          style={{ transition: 'opacity 300ms ease, fill 300ms ease' }}
        />
        <path
          d="M12 12 C12 10.5, 11.5 6, 12 3 C12.5 6, 13 10.5, 12 12"
          fill="var(--color-fan-on)"
          opacity={isOn ? 1 : 0.5}
          transform="rotate(120, 12, 12)"
          style={{ transition: 'opacity 300ms ease, fill 300ms ease' }}
        />
        <path
          d="M12 12 C12 10.5, 11.5 6, 12 3 C12.5 6, 13 10.5, 12 12"
          fill="var(--color-fan-on)"
          opacity={isOn ? 1 : 0.5}
          transform="rotate(240, 12, 12)"
          style={{ transition: 'opacity 300ms ease, fill 300ms ease' }}
        />
      </motion.g>

      <circle cx="12" cy="12" r="3" fill={isOn ? 'var(--color-fan-on)' : 'var(--color-fan-off)'} style={{ transition: 'fill 300ms ease' }} />
      <circle cx="12" cy="12" r="1.5" fill={isOn ? 'var(--color-fan-on)' : 'var(--color-text-muted)'} opacity={isOn ? 0.8 : 0.5} style={{ transition: 'fill 300ms ease, opacity 300ms ease' }} />
    </svg>
  );
}
