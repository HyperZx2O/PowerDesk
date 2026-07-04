import { memo } from 'react';
import clsx from 'clsx';
import type { Device } from '../../types/device';
import { isDeviceOn } from '../../types/device';
import { formatWatts } from '../../utils/formatters';
import { FanIcon } from './FanIcon';
import { LightIcon } from './LightIcon';

interface DeviceCardProps {
  device: Device;
}

function getFanSpeed(room: string): 'slow' | 'normal' | 'fast' {
  if (room === 'drawing-room') return 'slow';
  if (room === 'work-room-2') return 'fast';
  return 'normal';
}

export const DeviceCard = memo(function DeviceCard({ device }: DeviceCardProps) {
  const isOn = isDeviceOn(device.status);
  const fanSpeed = device.type === 'fan' ? getFanSpeed(device.room) : 'normal';

  return (
    <div
      className={clsx(
        'p-2 bg-bg rounded-md transition-opacity',
        !isOn && 'opacity-50'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-text-primary truncate max-w-[4rem]">
          {device.name}
        </span>
        <span
          className={clsx(
            'px-1 py-[1px] text-[10px] font-mono font-medium rounded-sm leading-none',
            isOn
              ? device.type === 'fan'
                ? 'text-fan-on bg-fan-on/10'
                : 'text-light-on bg-light-on/10'
              : 'text-text-muted bg-border/50'
          )}
        >
          {isOn ? 'ON' : 'OFF'}
        </span>
      </div>

      <div className="flex justify-center my-1">
        {device.type === 'fan' ? (
          <FanIcon isOn={isOn} size={20} speed={fanSpeed} />
        ) : (
          <LightIcon isOn={isOn} size={20} />
        )}
      </div>

      <div className="text-center">
        <span className="font-mono text-[11px] text-text-muted tabular-nums">
          {isOn ? formatWatts(device.powerDraw) : '—'}
        </span>
      </div>
    </div>
  );
});

export function SkeletonDeviceCard() {
  return (
    <div className="p-2 bg-bg rounded-md border border-border animate-pulse">
      <div className="flex items-center justify-between mb-1">
        <div className="h-3 w-12 bg-border rounded" />
        <div className="h-3 w-6 bg-border rounded" />
      </div>
      <div className="flex justify-center my-1">
        <div className="w-5 h-5 bg-border rounded" />
      </div>
      <div className="flex justify-center">
        <div className="h-3 w-8 bg-border rounded" />
      </div>
    </div>
  );
}
