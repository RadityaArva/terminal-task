'use client';

import { useTermFlowStore } from '@/lib/store';

export default function MissionControlView({ onSelectTask }: { onSelectTask: (id: string) => void }) {
  const { tasks, projects } = useTermFlowStore();
  const urgent = [...tasks].filter((task) => task.status !== 'done').sort((a, b) => {
    const priority = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priority[a.priority] - priority[b.priority] || a.dueDate.localeCompare(b.dueDate);
  });
  return <section className="space-y-4"><header><h1 className="text-lg font-bold text-[var(--accent-main)]">&gt; mission-control</h1><p className="text-xs text-[var(--text-muted)]">Prioritas tinggi lintas seluruh project.</p></header><div className="grid gap-3 md:grid-cols-2">{urgent.map((task) => <button key={task.id} type="button" onClick={() => onSelectTask(task.id)} className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] p-3 text-left transition hover:border-[var(--accent-cyan)]"><div className="flex justify-between gap-2"><strong className="truncate text-[var(--text-bright)]">{task.title}</strong><span className="text-[10px] text-[var(--accent-red)]">{task.priority}</span></div><div className="mt-2 text-[10px] text-[var(--text-muted)]">{projects.find((project) => project.id === task.projectId)?.name || task.projectId} · due {task.dueDate}</div></button>)}</div>{urgent.length === 0 && <div className="rounded border border-dashed border-[var(--border-main)] p-8 text-center text-xs text-[var(--text-muted)]">Tidak ada task aktif berisiko tinggi.</div>}</section>;
}
