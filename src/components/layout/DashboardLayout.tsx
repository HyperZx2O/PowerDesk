import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  topBar: ReactNode;
  roomGrid: ReactNode;
  powerMeter: ReactNode;
  roomPowerBars: ReactNode;
  powerChart: ReactNode;
  alertPanel: ReactNode;
  floorPlan?: ReactNode;
}

export function DashboardLayout({
  topBar,
  roomGrid,
  powerMeter,
  roomPowerBars,
  powerChart,
  alertPanel,
  floorPlan,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-bg">
      {topBar}

      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-16 pb-12">
        {/* Hero: Power Meter + bars */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 mb-6">
          {powerMeter}
          <div className="space-y-3 self-end pb-2">
            {roomPowerBars}
          </div>
        </div>

        {/* Content: Rooms + Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 mb-6">
          <div className="space-y-4">{roomGrid}</div>
          <div className="space-y-4">
            {alertPanel}
            {powerChart}
          </div>
        </div>

        {/* Floor Plan */}
        {floorPlan && <div className="mt-6">{floorPlan}</div>}
      </div>
    </div>
  );
}
