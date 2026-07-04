import { motion } from 'framer-motion';
import clsx from 'clsx';
import { formatRoomName, formatWatts } from '../../utils/formatters';

interface RoomPowerBarProps {
  room: string;
  watts: number;
  totalWatts: number;
}

function getBarColor(watts: number): string {
  if (watts < 100) return 'bg-success';
  if (watts < 200) return 'bg-alert';
  return 'bg-critical';
}

export function RoomPowerBar({ room, watts, totalWatts }: RoomPowerBarProps) {
  const percentage = totalWatts > 0 ? (watts / totalWatts) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-muted w-24 truncate">
        {formatRoomName(room)}
      </span>
      <div className="flex-1 h-1 bg-border overflow-hidden relative rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={clsx('h-full rounded-full', getBarColor(watts))}
        />
      </div>
      <span className="font-mono text-xs text-text-muted w-12 text-right tabular-nums">
        {formatWatts(watts)}
      </span>
    </div>
  );
}
