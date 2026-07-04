import { AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { Alert } from '../../types/alert';
import { AlertItem } from './AlertItem';

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
  alertCount: number;
  isLoading?: boolean;
}

function AlertSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-border last:border-0">
      <div className="w-4 h-4 bg-border rounded animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-3/4 bg-border rounded animate-pulse" />
        <div className="h-2.5 w-1/2 bg-border rounded animate-pulse" />
      </div>
    </div>
  );
}

export function AlertPanel({ alerts, onDismiss, alertCount, isLoading }: AlertPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg border border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-border rounded animate-pulse" />
            <div className="h-3 w-16 bg-border rounded animate-pulse" />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto scrollbar-thin">
          <AlertSkeleton />
          <AlertSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-alert" />
          <h2 className="text-xs font-medium text-text-primary uppercase tracking-wide">
            Alerts
          </h2>
          {alertCount > 0 && (
            <span className="px-1.5 py-[1px] text-[10px] font-mono font-medium bg-alert/15 text-alert rounded-sm leading-none">
              {alertCount}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto scrollbar-thin">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <CheckCircle className="w-6 h-6 text-success mb-2" />
            <p className="text-xs text-text-muted text-center">
              All clear
            </p>
          </div>
        ) : (
          <div className="p-1.5 space-y-1">
            <AnimatePresence mode="popLayout">
              {alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onDismiss={onDismiss}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
