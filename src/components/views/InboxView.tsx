'use client';

import { useTermFlowStore } from '@/lib/store';
import { Inbox, Plus } from 'lucide-react';
import CustomSelect from '@/components/terminal-ui/CustomSelect';
import CustomDatePicker from '@/components/terminal-ui/CustomDatePicker';

export default function InboxView({ onSelectTask }: { onSelectTask: (id: string) => void }) {
  const { activeBoardId, tasks, projects, updateTask } = useTermFlowStore();
  const inboxTasks = tasks.filter((task) => (!activeBoardId || task.boardId === activeBoardId) && task.projectId === 'inbox');
  const assign = (id: string, projectId: string) => updateTask(id, { projectId });

  return (
    <section className="terminal-panel space-y-4 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-main)] pb-3">
        <div><div className="font-bold text-[var(--accent-cyan)]">&gt; inbox --triage</div><div className="mt-1 text-[10px] text-[var(--text-muted)]">{inboxTasks.length} task belum disortir</div></div>
        <span className="rounded border border-[var(--accent-yellow)]/50 bg-[var(--accent-yellow)]/10 px-2 py-1 text-[10px] text-[var(--accent-yellow)]">Inbox Zero</span>
      </header>
      {inboxTasks.length === 0 ? <div className="rounded border border-dashed border-[var(--border-main)] p-8 text-center text-xs text-[var(--text-muted)]">Inbox kosong. Gunakan command <strong className="text-[var(--accent-cyan)]">capture</strong> untuk menambahkan task cepat.</div> : <div className="space-y-2">{inboxTasks.map((task) => <article key={task.id} className="rounded border border-[var(--border-main)] bg-[var(--bg-app)] p-3"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={() => onSelectTask(task.id)} className="min-w-0 truncate text-left font-bold text-[var(--text-bright)] hover:text-[var(--accent-cyan)]">{task.title}</button><div className="flex flex-wrap gap-2"><span className="w-auto min-w-[120px]"><CustomSelect value={task.projectId} onChange={(v) => assign(task.id, v)} options={[{ value: 'inbox', label: 'Inbox' }, ...projects.filter((project) => project.id !== 'inbox').map((project) => ({ value: project.id, label: project.name }))]} ariaLabel={`Assign project ${task.title}`} triggerClassName="py-1 text-[11px]" /></span><span className="w-auto"><CustomDatePicker value={task.dueDate} onChange={(v) => updateTask(task.id, { dueDate: v, endDate: v })} ariaLabel={`Due date ${task.title}`} /></span></div></div><div className="mt-2 flex flex-wrap items-center gap-2"><input aria-label={`Labels ${task.title}`} placeholder="label1, label2" defaultValue={task.labels.join(', ')} onBlur={(event) => updateTask(task.id, { labels: event.target.value.split(',').map((label) => label.trim()).filter(Boolean) })} className="terminal-input py-1 text-[11px]" /><span className="text-[10px] text-[var(--text-muted)]">{task.id} · {task.dueDate}</span></div></article>)}</div>}
    </section>
  );
}
