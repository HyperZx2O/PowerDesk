import clsx from 'clsx';
import type { Device } from '../../types/device';
import { DeviceCard } from '../device/DeviceCard';
import { totalWatts, countOn } from '../../utils/deviceHelpers';
import { formatRoomName, formatWatts } from '../../utils/formatters';

interface RoomCardProps {
  room: string;
  devices: Device[];
  hasAlert?: boolean;
}

export function RoomCard({ room, devices, hasAlert = false }: RoomCardProps) {
  const roomWatts = totalWatts(devices);
  const devicesOn = countOn(devices);
  const totalDevices = devices.length;

  return (
    <div
      id={`room-${room}`}
      className={clsx(
        'p-4 bg-surface rounded-lg border transition-colors duration-300',
        hasAlert ? 'border-alert/50 bg-alert/[0.03]' : 'border-border'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">
          {formatRoomName(room)}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-muted tabular-nums">
            {formatWatts(roomWatts)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-text-muted">
          {devicesOn}/{totalDevices}
        </span>
        <div className="flex-1 h-0.5 bg-border overflow-hidden rounded-full">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${(devicesOn / totalDevices) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}
