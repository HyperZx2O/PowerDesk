import { motion } from 'framer-motion';
import { Moon, Timer, X } from 'lucide-react';
import type { Alert } from '../../types/alert';
import { formatRelativeTime, formatRoomName } from '../../utils/formatters';
import clsx from 'clsx';

interface AlertItemProps {
  alert: Alert;
  onDismiss: (id: string) => void;
}

const alertConfig: Record<string, { icon: React.ElementType; iconColor: string }> = {
  'after-hours': {
    icon: Moon,
    iconColor: 'text-alert',
  },
  'continuous-runtime': {
    icon: Timer,
    iconColor: 'text-alert',
  },
};

export function AlertItem({ alert, onDismiss }: AlertItemProps) {
  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-start gap-2.5 p-2.5 rounded-md border border-border bg-bg/50"
    >
      <Icon className={clsx('w-4 h-4 mt-0.5 flex-shrink-0', config.iconColor)} />

      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-primary">{alert.message}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] text-text-muted">
            {formatRoomName(alert.room)}
          </span>
          <span className="text-[11px] text-text-muted">·</span>
          <span className="text-[11px] font-mono text-text-muted tabular-nums">
            {formatRelativeTime(alert.triggeredAt)}
          </span>
        </div>
      </div>

      <button
        onClick={() => onDismiss(alert.id)}
        className="p-0.5 hover:bg-border rounded transition-colors flex-shrink-0 self-start mt-0.5"
        aria-label="Dismiss alert"
      >
        <X className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
      </button>
    </motion.div>
  );
}
