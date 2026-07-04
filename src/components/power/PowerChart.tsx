import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';
import type { PowerReading } from '../../types/power';
import { formatTime } from '../../utils/formatters';

interface PowerChartProps {
  data: PowerReading[];
  isLoading?: boolean;
}

export function PowerChart({ data, isLoading }: PowerChartProps) {
  const chartData = useMemo(() => {
    return data.map((reading) => ({
      time: formatTime(reading.time),
      watts: reading.watts,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-4 bg-surface rounded-lg border border-border">
        <div className="h-3 w-24 bg-border rounded animate-pulse mb-4" />
        <div className="h-32 bg-border/50 rounded animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-4 bg-surface rounded-lg border border-border h-40 flex items-center justify-center">
        <p className="text-xs text-text-muted">No power data yet</p>
      </div>
    );
  }

  const maxWatts = Math.max(...data.map((d) => d.watts), 100);

  return (
    <div className="p-4 bg-surface rounded-lg border border-border">
      <h2 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-4">
        Power History
      </h2>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="var(--color-text-muted)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="var(--color-text-muted)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              domain={[0, Math.ceil(maxWatts / 50) * 50]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: 'var(--color-text-primary)' }}
              itemStyle={{ color: 'var(--color-primary)' }}
              formatter={(value: number) => [`${value}W`, 'Power']}
            />
            <defs>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="watts"
              stroke="none"
              fill="url(#powerGradient)"
              fillOpacity={1}
            />
            <Line
              type="monotone"
              dataKey="watts"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--color-primary)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
