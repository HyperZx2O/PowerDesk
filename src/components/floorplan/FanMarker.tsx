import { useState } from 'react';
import { FanIcon } from '../device/FanIcon';
import { formatRelativeTime } from '../../utils/formatters';

interface FanMarkerProps {
  x: number;
  y: number;
  isOn: boolean;
  label: string;
  deviceName: string;
  watts: number;
  lastChanged: string;
  speed?: 'slow' | 'normal' | 'fast';
}

export function FanMarker({ x, y, isOn, label, deviceName, watts, lastChanged, speed = 'normal' }: FanMarkerProps) {
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
      <g transform={`translate(${x - 12}, ${y - 12})`}>
        <FanIcon isOn={isOn} size={24} speed={speed} />
      </g>
      <text
        x={x}
        y={y + 20}
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
