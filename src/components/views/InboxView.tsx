'use client';

import { useTermFlowStore } from '@/lib/store';
import { Inbox, Plus } from 'lucide-react';

export default function InboxView({ onSelectTask }: { onSelectTask: (id: string) => void }) {
  const { tasks, projects, updateTask } = useTermFlowStore();
  const inboxTasks = tasks.filter((task) => task.projectId === 'inbox');
  const assign = (id: string, projectId: string) => updateTask(id, { projectId });

  return (
    <section className="terminal-panel space-y-4 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-main)] pb-3">
        <div><div className="font-bold text-[var(--accent-cyan)]">&gt; inbox --triage</div><div className="mt-1 text-[10px] text-[var(--text-muted)]">{inboxTasks.length} task belum disortir</div></div>
        <span className="rounded border border-[var(--accent-yellow)]/50 bg-[var(--accent-yellow)]/10 px-2 py-1 text-[10px] text-[var(--accent-yellow)]">Inbox Zero</span>
      </header>
      {inboxTasks.length === 0 ? <div className="rounded border border-dashed border-[var(--border-main)] p-8 text-center text-xs text-[var(--text-muted)]">Inbox kosong. Gunakan command <strong className="text-[var(--accent-cyan)]">capture</strong> untuk menambahkan task cepat.</div> : <div className="space-y-2">{inboxTasks.map((task) => <article key={task.id} className="rounded border border-[var(--border-main)] bg-[var(--bg-app)] p-3"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={() => onSelectTask(task.id)} className="min-w-0 truncate text-left font-bold text-[var(--text-bright)] hover:text-[var(--accent-cyan)]">{task.title}</button><div className="flex flex-wrap gap-2"><select aria-label={`Assign project ${task.title}`} value={task.projectId} onChange={(event) => assign(task.id, event.target.value)} className="terminal-input w-auto py-1 text-[11px]"><option value="inbox">Inbox</option>{projects.filter((project) => project.id !== 'inbox').map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><input aria-label={`Due date ${task.title}`} type="date" value={task.dueDate} onChange={(event) => updateTask(task.id, { dueDate: event.target.value, endDate: event.target.value })} className="terminal-input w-auto py-1 text-[11px]" /></div></div><div className="mt-2 flex flex-wrap items-center gap-2"><input aria-label={`Labels ${task.title}`} placeholder="label1, label2" defaultValue={task.labels.join(', ')} onBlur={(event) => updateTask(task.id, { labels: event.target.value.split(',').map((label) => label.trim()).filter(Boolean) })} className="terminal-input py-1 text-[11px]" /><span className="text-[10px] text-[var(--text-muted)]">{task.id} · {task.dueDate}</span></div></article>)}</div>}
    </section>
  );
}
