'use client';

import { useState } from 'react';
import { useTermFlowStore, TaskStatus } from '@/lib/store';
import TaskCard from '../task/TaskCard';
import { getTranslation } from '@/lib/i18n';

interface BoardViewProps {
  onSelectTask: (id: string) => void;
  selectedTaskId: string | null;
}

const columns: { status: TaskStatus; labelKey: string; icon: string; color: string }[] = [
  { status: 'todo', labelKey: 'status.todo', icon: '📌', color: 'border-[var(--accent-yellow)] text-[var(--accent-yellow)]' },
  { status: 'in_progress', labelKey: 'status.in_progress', icon: '⚡', color: 'border-[var(--accent-cyan)] text-[var(--accent-cyan)]' },
  { status: 'review', labelKey: 'status.review', icon: '🔍', color: 'border-[var(--accent-purple)] text-[var(--accent-purple)]' },
  { status: 'done', labelKey: 'status.done', icon: '✅', color: 'border-[var(--accent-main)] text-[var(--accent-main)]' },
];

const nextStatus = (status: TaskStatus, direction: -1 | 1): TaskStatus => {
  const index = columns.findIndex((column) => column.status === status);
  return columns[Math.max(0, Math.min(columns.length - 1, index + direction))].status;
};

export default function BoardView({ onSelectTask, selectedTaskId }: BoardViewProps) {
  const {
    tasks, activeProjectId, moveTaskStatus, addTask, deleteTask, searchFilter, lang
  } = useTermFlowStore();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [mobileColumnIndex, setMobileColumnIndex] = useState(0);
  const [draft, setDraft] = useState({
    title: '', description: '', status: 'todo' as TaskStatus, priority: 'medium' as const,
    assignee: 'radit', startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), dueDate: new Date().toISOString().slice(0, 10), dueTime: '09:00', labels: '', subtasks: ''
  });

  const filteredTasks = tasks.filter((task) => {
    if (task.projectId !== activeProjectId) return false;
    if (!searchFilter) return true;
    const query = searchFilter.toLowerCase();
    if (query.startsWith('energy:')) return (task.energyLevel || 'medium') === query.slice(7);
    return [task.title, task.description, task.assignee, task.priority, task.status, task.energyLevel || 'medium', ...task.labels]
      .some((value) => value.toLowerCase().includes(query));
  });

  const createTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    addTask({
      title: draft.title.trim(),
      description: draft.description.trim(),
      status: draft.status,
      priority: draft.priority,
      assignee: draft.assignee.trim() || 'radit',
      startDate: draft.startDate,
      endDate: draft.endDate,
      dueDate: draft.dueDate,
      dueTime: draft.dueTime,
      labels: draft.labels.split(',').map((label) => label.trim().replace(/^#/, '')).filter(Boolean),
      subtasks: draft.subtasks.split('\n').map((title, index) => ({
        id: `draft-${Date.now()}-${index}`, title: title.trim(), completed: false
      })).filter((subtask) => subtask.title)
    });
    setDraft({ title: '', description: '', status: 'todo', priority: 'medium', assignee: 'radit', startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), dueDate: new Date().toISOString().slice(0, 10), dueTime: '09:00', labels: '', subtasks: '' });
    setIsComposerOpen(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--border-main)] bg-[var(--bg-surface)] p-3 rounded-lg shadow-md">
            <div className="text-xs text-[var(--text-muted)]">
              <span className="text-[var(--accent-cyan)] font-bold">&gt; board --interactive</span>
              <span className="ml-2">drag kartu ke kolom lain · tap tombol panah di mobile</span>
            </div>
            <div className="grid grid-cols-4 gap-1 rounded-lg border border-[var(--border-main)] bg-[var(--bg-app)] p-1 sm:hidden">
              {columns.map((column, index) => <button key={column.status} type="button" onClick={() => setMobileColumnIndex(index)} className={`min-h-11 rounded px-1 text-[10px] ${mobileColumnIndex === index ? 'bg-[var(--bg-muted)] font-bold text-[var(--accent-main)]' : 'text-[var(--text-muted)]'}`}><span className="block text-base">{column.icon}</span>{getTranslation(column.labelKey, lang)}</button>)}
            </div>
            <button
              type="button"
              onClick={() => setIsComposerOpen((open) => !open)}
              className="rounded border border-[var(--accent-main)] bg-[var(--accent-main)]/10 px-3 py-2 text-xs font-bold text-[var(--accent-main)] transition hover:bg-[var(--accent-main)] hover:text-[var(--bg-app)]"
            >
              {isComposerOpen ? '✕ Tutup form' : '+ New board'}
            </button>
          </div>

          {isComposerOpen && (
            <form onSubmit={createTask} className="grid gap-3 rounded-lg border border-[var(--accent-cyan)]/50 bg-[var(--bg-surface)] p-4 text-xs shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 text-[var(--accent-cyan)] font-bold"><span>&gt;</span><span>new task --interactive</span></div>
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Judul board / task *" className="terminal-input text-sm font-bold" />
              <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Deskripsi atau note utama..." rows={3} className="terminal-input resize-y" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as TaskStatus })} className="terminal-input"><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="review">Review</option><option value="done">Done</option></select>
                <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as typeof draft.priority })} className="terminal-input"><option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option><option value="urgent">Urgent priority</option></select>
                <input value={draft.assignee} onChange={(e) => setDraft({ ...draft, assignee: e.target.value })} placeholder="Assignee" className="terminal-input" />
                <div className="grid grid-cols-2 gap-2"><input type="date" aria-label="Tanggal mulai" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value, dueDate: draft.endDate || e.target.value })} className="terminal-input" /><input type="date" aria-label="Tanggal selesai" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value, dueDate: e.target.value })} className="terminal-input" /></div>
              </div>
              <input value={draft.labels} onChange={(e) => setDraft({ ...draft, labels: e.target.value })} placeholder="Labels, pisahkan dengan koma (frontend, ui)" className="terminal-input" />
              <textarea value={draft.subtasks} onChange={(e) => setDraft({ ...draft, subtasks: e.target.value })} placeholder="Checklist awal (satu item per baris)" rows={3} className="terminal-input resize-y" />
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setIsComposerOpen(false)} className="terminal-button">Batal</button><button type="submit" className="terminal-button terminal-button-primary">Simpan board ↵</button></div>
            </form>
          )}

          <div className="board-scroller flex flex-col gap-3 overflow-visible pb-3 sm:flex-row sm:snap-x sm:snap-mandatory sm:overflow-x-auto sm:overscroll-x-contain sm:gap-4">
            {columns.map((column) => {
              const columnTasks = filteredTasks.filter((task) => task.status === column.status);
              return (
                <div
                  key={column.status}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggedTaskId) moveTaskStatus(draggedTaskId, column.status);
                    setDraggedTaskId(null);
                  }}
                  className={`terminal-surface flex min-h-[360px] w-full shrink-0 snap-start flex-col space-y-3 rounded-lg border border-[var(--border-main)] bg-[var(--bg-app)] p-3 transition-colors hover:border-[var(--accent-cyan)]/60 sm:w-[340px] sm:min-w-[340px] lg:w-[300px] lg:min-w-[300px] xl:w-auto xl:min-w-[250px] xl:flex-1 ${column.status === columns[mobileColumnIndex].status ? 'flex' : 'hidden sm:flex'} ${column.status !== columns[mobileColumnIndex].status ? 'sm:flex' : ''}`}
                >
                  <div className={`flex items-center justify-between border-b-2 pb-2 ${column.color}`}>
                    <div className="flex items-center gap-2 text-xs font-bold"><span>{column.icon}</span><span>{getTranslation(column.labelKey, lang)}</span></div>
                    <span className="rounded border border-[var(--border-main)] bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">{columnTasks.length}</span>
                  </div>
                  <div className="max-h-[31rem] flex-1 space-y-2.5 overflow-y-auto pr-1">
                    {columnTasks.map((task) => (
                      <div key={task.id} draggable onDragStart={() => setDraggedTaskId(task.id)} onDragEnd={() => setDraggedTaskId(null)} className="group relative touch-manipulation">
                        <TaskCard
                          task={task}
                          isSelected={task.id === selectedTaskId}
                          onSelect={() => onSelectTask(task.id)}
                          onDelete={() => {
                            if (window.confirm(`Hapus task ${task.id}?`)) deleteTask(task.id);
                          }}
                        />
                        <div className="mt-1 flex justify-between gap-1 sm:invisible sm:absolute sm:right-1 sm:top-1 sm:mt-0 sm:group-hover:visible">
                          <button type="button" disabled={column.status === 'todo'} onClick={() => moveTaskStatus(task.id, nextStatus(column.status, -1))} className="flex-1 rounded border border-[var(--border-main)] bg-[var(--bg-surface)] py-1 text-[11px] text-[var(--text-muted)] disabled:opacity-30 sm:flex-none sm:px-2" aria-label="Move task left">←</button>
                          <button type="button" disabled={column.status === 'done'} onClick={() => moveTaskStatus(task.id, nextStatus(column.status, 1))} className="flex-1 rounded border border-[var(--border-main)] bg-[var(--bg-surface)] py-1 text-[11px] text-[var(--accent-cyan)] disabled:opacity-30 sm:flex-none sm:px-2" aria-label="Move task right">→</button>
                        </div>
                      </div>
                    ))}
                    {columnTasks.length === 0 && <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-[var(--border-main)]/50 text-center text-[11px] text-[var(--text-muted)]">Drop task di sini</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
