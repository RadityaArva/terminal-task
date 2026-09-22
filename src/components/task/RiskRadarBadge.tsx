'use client';

import { Task, useTermFlowStore } from '@/lib/store';

const CURRENT_TIME = new Date().getTime();

export default function RiskRadarBadge({ task }: { task: Task }) {
  const tasks = useTermFlowStore((state) => state.tasks);
  if (task.status === 'done') return null;

  const completed = tasks.filter((item) => item.status === 'done' && item.completedAt);
  const durations = completed
    .map((item) => (new Date(item.completedAt!).getTime() - new Date(item.createdAt).getTime()) / 86_400_000)
    .filter((days) => Number.isFinite(days) && days > 0);
  const averageDays = durations.length ? durations.reduce((sum, days) => sum + days, 0) / durations.length : 2;
  const dueInDays = (new Date(`${task.dueDate}T23:59:59`).getTime() - CURRENT_TIME) / 86_400_000;
  const incompleteSubtasks = task.subtasks.filter((subtask) => !subtask.completed).length;
  const risk = dueInDays < 0 || (dueInDays <= averageDays && task.status !== 'todo') || (incompleteSubtasks > 0 && dueInDays <= Math.max(1, incompleteSubtasks));
  if (!risk) return null;

  const suggestion = dueInDays < 0 ? 'geser due date' : incompleteSubtasks > 1 ? 'pecah jadi sub-task' : 'geser due date';
  return <span title={`Risk Radar: ${suggestion}`} className="inline-flex items-center gap-1 rounded border border-[var(--accent-red)]/60 bg-[var(--accent-red)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent-red)]">⚠ {suggestion}</span>;
}
