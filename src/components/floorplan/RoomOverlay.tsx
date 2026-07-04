import { motion } from 'framer-motion';

interface RoomOverlayProps {
  x: number;
  y: number;
  width: number;
  height: number;
  room: string;
  hasAlert: boolean;
  onClick?: () => void;
}

export function RoomOverlay({ x, y, width, height, room, hasAlert, onClick }: RoomOverlayProps) {
  return (
    <g>
      {hasAlert && (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="none"
          stroke="var(--color-alert)"
          strokeWidth={2}
          strokeDasharray="4 4"
          rx={4}
        />
      )}
      <motion.rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={hasAlert ? 'var(--color-alert)' : 'transparent'}
        fillOpacity={hasAlert ? 0.1 : 0}
        initial={{ fillOpacity: 0 }}
        animate={hasAlert ? { fillOpacity: [0.1, 0.3, 0.1] } : { fillOpacity: 0 }}
        transition={{ duration: 1.5, repeat: hasAlert ? Infinity : 0, ease: 'easeInOut' }}
        whileHover={{ fillOpacity: hasAlert ? 0.2 : 0.08 }}
        onClick={onClick}
        style={{ cursor: 'pointer' }}
        data-room={room}
      />
    </g>
  );
}
