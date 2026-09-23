'use client';

import { useMemo } from 'react';
import { useTermFlowStore } from '@/lib/store';
import { BarChart3, TrendingDown } from 'lucide-react';

const DAY = 86_400_000;

export default function AnalyticsView() {
  const { tasks, activeProjectId, projects } = useTermFlowStore();
  const projectTasks = tasks.filter((task) => task.projectId === activeProjectId);
  const { burndown, velocity, maxBurndown, maxVelocity } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const burndown = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today.getTime() - (6 - index) * DAY);
      const key = date.toISOString().slice(0, 10);
      const remaining = projectTasks.filter((task) => {
        if (task.status === 'done' && task.completedAt && task.completedAt.slice(0, 10) <= key) return false;
        return task.createdAt <= key;
      }).length;
      return { label: key.slice(5), value: remaining };
    });
    const velocity = Array.from({ length: 4 }, (_, index) => {
      const end = new Date(today.getTime() - (3 - index) * 7 * DAY);
      const start = new Date(end.getTime() - 7 * DAY);
      const value = projectTasks.filter((task) => task.status === 'done' && task.completedAt && new Date(task.completedAt) >= start && new Date(task.completedAt) < end).length;
      return { label: `W${index + 1}`, value };
    });
    return { burndown, velocity, maxBurndown: Math.max(1, ...burndown.map((point) => point.value)), maxVelocity: Math.max(1, ...velocity.map((point) => point.value)) };
  }, [projectTasks]);
  const projectName = projects.find((project) => project.id === activeProjectId)?.name || activeProjectId;

  return <section className="space-y-4"><header><h1 className="text-lg font-bold text-[var(--accent-main)]">&gt; analytics --{projectName}</h1><p className="text-xs text-[var(--text-muted)]">Burndown 7 hari dan velocity 4 minggu terakhir.</p></header><div className="grid gap-4 lg:grid-cols-2"><Chart title="Burndown · tasks remaining" points={burndown} max={maxBurndown} color="var(--accent-cyan)" line /><Chart title="Velocity · completed tasks" points={velocity} max={maxVelocity} color="var(--accent-main)" /></div></section>;
}

function Chart({ title, points, max, color, line = false }: { title: string; points: Array<{ label: string; value: number }>; max: number; color: string; line?: boolean }) {
  const width = 640;
  const height = 260;
  const padding = 34;
  const x = (index: number) => padding + index * ((width - padding * 2) / Math.max(1, points.length - 1));
  const y = (value: number) => height - padding - (value / max) * (height - padding * 2);
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.value)}`).join(' ');
  return <div className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] p-3"><h2 className="mb-2 text-xs font-bold text-[var(--text-bright)]">{title}</h2><svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={title}><line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-main)" />{points.map((point, index) => <g key={point.label}><text x={x(index)} y={height - 10} textAnchor="middle" fill="var(--text-muted)" fontSize="11">{point.label}</text>{line ? <circle cx={x(index)} cy={y(point.value)} r="5" fill={color} /> : <rect x={x(index) - 18} y={y(point.value)} width="36" height={height - padding - y(point.value)} rx="3" fill={color} opacity="0.85" />}<text x={x(index)} y={y(point.value) - 8} textAnchor="middle" fill="var(--text-bright)" fontSize="11">{point.value}</text></g>)}{line && <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}</svg></div>;
}
