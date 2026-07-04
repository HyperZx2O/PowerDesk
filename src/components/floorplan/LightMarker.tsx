import { useState } from 'react';
import { formatRelativeTime } from '../../utils/formatters';

interface LightMarkerProps {
  x: number;
  y: number;
  isOn: boolean;
  label: string;
  deviceName: string;
  watts: number;
  lastChanged: string;
}

export function LightMarker({ x, y, isOn, label, deviceName, watts, lastChanged }: LightMarkerProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <g
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowTooltip(s => !s); }}
      tabIndex={0}
      role="button"
      aria-label={`${deviceName}: ${isOn ? 'ON' : 'OFF'}`}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow ring — always rendered, opacity transitions for cross-fade */}
      <circle
        cx={x}
        cy={y}
        r={22}
        fill="none"
        stroke="var(--color-light-on)"
        strokeWidth="4"
        opacity={isOn ? 0.35 : 0}
        style={{ transition: 'opacity 300ms ease' }}
      />
      {/* Main circle — CSS transition for cross-fade, CSS animation for pulse */}
      <circle
        cx={x}
        cy={y}
        r={14}
        fill={isOn ? 'var(--color-light-on)' : 'var(--color-light-off)'}
        style={{
          transition: 'fill 300ms ease, opacity 300ms ease',
          opacity: isOn ? 0.8 : 0.4,
        }}
        className={isOn ? 'light-pulse' : ''}
      />
      <text
        x={x}
        y={y + 22}
        textAnchor="middle"
        fill="var(--color-text-muted)"
        fontSize="9"
        fontFamily="'JetBrains Mono', monospace"
      >
        {label}
      </text>

      {showTooltip && (
        <g>
          <rect
            x={x - 55}
            y={y - 60}
            width="110"
            height="48"
            rx="4"
            fill="var(--color-surface)"
            stroke="var(--color-border)"
            strokeWidth="1"
          />
          <text
            x={x}
            y={y - 45}
            textAnchor="middle"
            fill="var(--color-text-primary)"
            fontSize="10"
            fontFamily="'Geist Sans', system-ui, sans-serif"
            fontWeight="500"
          >
            {deviceName}
          </text>
          <text
            x={x}
            y={y - 33}
            textAnchor="middle"
            fill={isOn ? 'var(--color-success)' : 'var(--color-text-muted)'}
            fontSize="9"
            fontFamily="'JetBrains Mono', monospace"
          >
            {isOn ? `${watts}W · ON` : 'OFF'}
          </text>
          <text
            x={x}
            y={y - 22}
            textAnchor="middle"
            fill="var(--color-text-muted)"
            fontSize="8"
            fontFamily="'JetBrains Mono', monospace"
          >
            {formatRelativeTime(lastChanged)}
          </text>
        </g>
      )}
    </g>
  );
}
