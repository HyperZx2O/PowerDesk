import clsx from 'clsx';

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

interface TopBarProps {
  connectionStatus: ConnectionStatus;
}

const statusConfig = {
  connected: { color: 'bg-success', text: 'Live' },
  reconnecting: { color: 'bg-alert', text: 'Reconnecting' },
  disconnected: { color: 'bg-critical', text: 'Offline' },
};

export function TopBar({ connectionStatus }: TopBarProps) {
  const config = statusConfig[connectionStatus];

  return (
    <header className="sticky top-4 z-50 flex items-center justify-between mx-auto max-w-7xl w-fit px-5 py-2.5 rounded-full bg-surface/80 backdrop-blur-md border border-border">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-text-primary tracking-tight">
          PowerDesk
        </h1>
        <span className="w-px h-3.5 bg-border" />
        <span className="text-[11px] font-medium text-text-muted tracking-wide uppercase">
          26 Techathon
        </span>
      </div>

      <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
        <div className={clsx('w-1.5 h-1.5 rounded-full', config.color)} />
        <span className="text-[11px] font-medium text-text-muted">{config.text}</span>
      </div>
    </header>
  );
}
