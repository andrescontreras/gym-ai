import React from 'react';
import { cn } from '@/lib/utils/cn';
import { StatusChip } from './StatusChip';

interface RecommendationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  stimulusMatch?: number;
  sets?: string;
  reps?: string;
  load?: string;
  rpe?: string;
  justification?: string;
}

export function RecommendationCard({
  title,
  stimulusMatch,
  sets,
  reps,
  load,
  rpe,
  justification,
  className,
  ...props
}: RecommendationCardProps) {
  return (
    <article
      className={cn(
        'rounded-xl border border-outline-variant bg-surface-container p-4',
        'space-y-3',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
        {typeof stimulusMatch === 'number' ? (
          <StatusChip variant="confidence">STIMULUS {stimulusMatch.toFixed(1)}%</StatusChip>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {sets ? <MetricLine label="SETS" value={sets} /> : null}
        {reps ? <MetricLine label="REPS" value={reps} /> : null}
        {load ? <MetricLine label="LOAD" value={load} /> : null}
        {rpe ? <MetricLine label="RPE" value={rpe} /> : null}
      </div>

      {justification ? (
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.08em] text-primary">Justification</p>
          <p className="mt-1 text-sm text-on-surface">{justification}</p>
        </div>
      ) : null}
    </article>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-outline/30 bg-surface-container-high px-2 py-2">
      <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">{label}</p>
      <p className="mt-1 text-sm font-semibold text-on-surface">{value}</p>
    </div>
  );
}
