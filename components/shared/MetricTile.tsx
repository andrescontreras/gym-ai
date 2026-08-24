import React from 'react';
import { cn } from '@/lib/utils/cn';

interface MetricTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  unit?: string;
  tone?: 'default' | 'accent';
}

export function MetricTile({ label, value, unit, tone = 'default', className, ...props }: MetricTileProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-outline/35 bg-surface-container px-3 py-3',
        tone === 'accent' && 'border-primary/45 bg-surface-container-high drop-shadow-glow-sm',
        className
      )}
      {...props}
    >
      <p className="text-xs uppercase tracking-[0.1em] text-on-surface-variant">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <p className="text-2xl font-bold leading-none tracking-tight text-on-surface">{value}</p>
        {unit ? <span className="text-xs uppercase text-on-surface-variant">{unit}</span> : null}
      </div>
    </div>
  );
}
