'use client';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';

interface ChartProps {
  type: 'line' | 'bar' | 'area';
  data: Record<string, unknown>[];
  series: { key: string; color: string; name?: string }[];
  xKey?: string;
  height?: number;
  className?: string;
}

export function Chart({ type, data, series, xKey = 'name', height = 300, className = '' }: ChartProps) {
  const gridColor = 'rgba(255,255,255,0.05)';
  const axisColor = 'rgba(255,255,255,0.3)';

  const commonProps = {
    data,
    margin: { top: 5, right: 20, left: 0, bottom: 5 },
  };

  const axisProps = {
    stroke: axisColor,
    tick: { fill: axisColor, fontSize: 11 },
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' ? (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            <Legend />
            {series.map(s => <Bar key={s.key} dataKey={s.key} fill={s.color} name={s.name || s.key} radius={[4, 4, 0, 0]} />)}
          </BarChart>
        ) : type === 'area' ? (
          <AreaChart {...commonProps}>
            <defs>
              {series.map(s => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            <Legend />
            {series.map(s => (
              <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} fill={`url(#grad-${s.key})`} name={s.name || s.key} />
            ))}
          </AreaChart>
        ) : (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            <Legend />
            {series.map(s => (
              <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} dot={false} name={s.name || s.key} strokeWidth={2} />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
export default Chart;
