'use client';

import { useState, useRef } from 'react';
import { useTermFlowStore, TaskStatus } from '@/lib/store';
import { Plus, GripVertical } from 'lucide-react';
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

export default function BoardView({ onSelectTask, selectedTaskId }: BoardViewProps) {
  const { tasks, activeProjectId, moveTaskStatus, addTask, deleteTask, searchFilter, lang } = useTermFlowStore();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropColumn, setDropColumn] = useState<TaskStatus | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragMovedRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
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
      title: draft.title.trim(), description: draft.description.trim(), status: draft.status, priority: draft.priority,
      assignee: draft.assignee.trim() || 'radit', startDate: draft.startDate, endDate: draft.endDate, dueDate: draft.dueDate, dueTime: draft.dueTime,
      labels: draft.labels.split(',').map((l) => l.trim().replace(/^#/, '')).filter(Boolean),
      subtasks: draft.subtasks.split('\n').map((title, index) => ({ id: `draft-${Date.now()}-${index}`, title: title.trim(), completed: false })).filter((s) => s.title)
    });
    setDraft({ title: '', description: '', status: 'todo', priority: 'medium', assignee: 'radit', startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), dueDate: new Date().toISOString().slice(0, 10), dueTime: '09:00', labels: '', subtasks: '' });
    setIsComposerOpen(false);
  };

  const columnFromPoint = (x: number, y: number): TaskStatus | null => {
    const el = document.elementFromPoint(x, y);
    const col = el?.closest?.('[data-column]') as HTMLElement | null;
    return (col?.dataset.column as TaskStatus | undefined) || null;
  };

  const autoScrollScroller = (clientX: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const rect = scroller.getBoundingClientRect();
    const edge = 48;
    if (clientX > rect.right - edge) scroller.scrollBy({ left: 14 });
    else if (clientX < rect.left + edge) scroller.scrollBy({ left: -14 });
  };

  // Pointer-based drag: works for mouse + touch. Started from the drag handle
  // (touch-action:none), so page/card scroll still works from the card body.
  const handleDragHandlePointerDown = (e: React.PointerEvent, taskId: string) => {
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragMovedRef.current = false;
    setDraggedTaskId(taskId);
    setGhostPos({ x: e.clientX, y: e.clientY });
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch { /* noop */ }
  };

  const handleDragHandlePointerMove = (e: React.PointerEvent, taskId: string) => {
    if (draggedTaskId !== taskId || !dragStartRef.current) return;
    const dx = Math.abs(e.clientX - dragStartRef.current.x);
    const dy = Math.abs(e.clientY - dragStartRef.current.y);
    if (dx + dy > 8) dragMovedRef.current = true;
    setGhostPos({ x: e.clientX, y: e.clientY });
    setDropColumn(columnFromPoint(e.clientX, e.clientY));
    autoScrollScroller(e.clientX);
  };

  const endPointerDrag = (taskId: string) => {
    if (draggedTaskId !== taskId) return;
    if (dragMovedRef.current && dropColumn) {
      const current = tasks.find((t) => t.id === taskId)?.status;
      if (current && current !== dropColumn) moveTaskStatus(taskId, dropColumn);
    }
    setDraggedTaskId(null);
    setDropColumn(null);
    setGhostPos(null);
    dragStartRef.current = null;
    // suppress the click that follows a real drag so the detail modal doesn't open
    if (dragMovedRef.current) {
      setTimeout(() => { dragMovedRef.current = false; }, 50);
    }
  };

  const draggedTask = draggedTaskId ? tasks.find((t) => t.id === draggedTaskId) : undefined;

  return (
    <div className="space-y-4">
      <section className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--border-main)] bg-[var(--bg-surface)] p-3 rounded-lg shadow-md">
          <div className="text-xs text-[var(--text-muted)]">
            <span className="text-[var(--accent-cyan)] font-bold">&gt; board --interactive</span>
            <span className="ml-2 hidden sm:inline">drag kartu ke kolom lain — desktop &amp; phone</span>
            <span className="ml-2 sm:hidden">tahan handle <span className="font-bold text-[var(--text-main)]">⋮⋮</span> lalu drag ke kolom lain</span>
          </div>
          <button type="button" onClick={() => setIsComposerOpen((o) => !o)} className="inline-flex items-center justify-center gap-1.5 rounded border border-[var(--accent-main)] bg-[var(--accent-main)]/10 px-3 py-2 text-xs font-bold text-[var(--accent-main)] transition hover:bg-[var(--accent-main)] hover:text-[var(--bg-app)]">{isComposerOpen ? '✕ Tutup form' : <><Plus size={14} strokeWidth={2} className="shrink-0" aria-hidden /> New board</>}</button>
        </div>

        {isComposerOpen && (
          <form onSubmit={createTask} className="grid gap-3 rounded-lg border border-[var(--accent-cyan)]/50 bg-[var(--bg-surface)] p-4 text-xs shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-[var(--accent-cyan)] font-bold"><span>&gt;</span><span>new task --interactive</span></div>
            <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Judul board / task *" className="terminal-input text-sm font-bold" />
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Deskripsi atau note utama..." rows={3} className="terminal-input resize-y" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as TaskStatus })} className="terminal-input"><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="review">Review</option><option value="done">Done</option></select>
              <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as typeof draft.priority })} className="terminal-input"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
              <input value={draft.assignee} onChange={(e) => setDraft({ ...draft, assignee: e.target.value })} placeholder="Assignee" className="terminal-input" />
              <div className="grid grid-cols-2 gap-2"><input type="date" aria-label="Tanggal mulai" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} className="terminal-input" /><input type="date" aria-label="Tanggal selesai" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} className="terminal-input" /></div>
            </div>
            <input value={draft.labels} onChange={(e) => setDraft({ ...draft, labels: e.target.value })} placeholder="Labels, pisahkan dengan koma" className="terminal-input" />
            <textarea value={draft.subtasks} onChange={(e) => setDraft({ ...draft, subtasks: e.target.value })} placeholder="Checklist (satu per baris)" rows={3} className="terminal-input resize-y" />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setIsComposerOpen(false)} className="terminal-button">Batal</button><button type="submit" className="terminal-button terminal-button-primary">Simpan board ↵</button></div>
          </form>
        )}

        {/* board: horizontal snap scroll on all sizes; drag via handle (touch) or native HTML5 (desktop) */}
        <div ref={scrollerRef} className="board-scroller flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible overscroll-x-contain pb-3 sm:gap-4">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter((task) => task.status === column.status);
            const isDropTarget = dropColumn === column.status && draggedTaskId;
            return (
              <div
                key={column.status}
                data-column={column.status}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
                  if (id) moveTaskStatus(id, column.status);
                  setDraggedTaskId(null);
                }}
                className={`terminal-surface flex min-h-[360px] w-[78vw] max-w-[360px] shrink-0 snap-start flex-col space-y-3 rounded-lg border bg-[var(--bg-app)] p-3 transition-colors sm:w-[340px] sm:min-w-[340px] lg:w-[300px] lg:min-w-[300px] xl:flex-1 xl:min-w-[250px] ${isDropTarget ? 'border-[var(--accent-main)] ring-2 ring-[var(--accent-main)]/40 bg-[var(--accent-main)]/5' : draggedTaskId ? 'border-[var(--accent-cyan)]/50' : 'border-[var(--border-main)] hover:border-[var(--accent-cyan)]/60'} ${column.color}`}
              >
                <div className={`flex items-center justify-between border-b-2 pb-2 ${column.color}`}>
                  <div className="flex items-center gap-2 text-xs font-bold"><span>{column.icon}</span><span>{getTranslation(column.labelKey, lang)}</span></div>
                  <span className="rounded border border-[var(--border-main)] bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">{columnTasks.length}</span>
                </div>
                <div className="max-h-[31rem] flex-1 space-y-2.5 overflow-y-auto pr-1">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => { setDraggedTaskId(task.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', task.id); }}
                      onDragEnd={() => setDraggedTaskId(null)}
                      onClickCapture={(e) => { if (dragMovedRef.current) { e.stopPropagation(); e.preventDefault(); } }}
                      className={`group relative select-none ${draggedTaskId === task.id ? 'opacity-60' : 'opacity-100'}`}
                    >
                      <TaskCard task={task} isSelected={task.id === selectedTaskId} onSelect={() => onSelectTask(task.id)} onDelete={() => { if (window.confirm(`Hapus task ${task.id}?`)) deleteTask(task.id); }} />
                      <div
                        role="button"
                        aria-label={`Drag ${task.id} ke kolom lain`}
                        title="Tahan lalu drag untuk pindah kolom"
                        onPointerDown={(e) => handleDragHandlePointerDown(e, task.id)}
                        onPointerMove={(e) => handleDragHandlePointerMove(e, task.id)}
                        onPointerUp={() => endPointerDrag(task.id)}
                        onPointerCancel={() => endPointerDrag(task.id)}
                        className="mt-1.5 flex min-h-[32px] cursor-grab items-center justify-center gap-1.5 rounded border border-dashed border-[var(--border-main)]/40 text-[10px] text-[var(--text-muted)] transition active:cursor-grabbing active:border-[var(--accent-main)] active:text-[var(--accent-main)] sm:border-transparent sm:opacity-60 sm:group-hover:opacity-100"
                        style={{ touchAction: 'none' }}
                      >
                        <span aria-hidden>⋮⋮</span><span>drag untuk pindah</span>
                      </div>
                    </div>
                  ))}
                  {columnTasks.length === 0 && <div className={`flex h-28 items-center justify-center rounded-md border border-dashed text-center text-[11px] text-[var(--text-muted)] ${isDropTarget ? 'border-[var(--accent-main)] text-[var(--accent-main)]' : 'border-[var(--border-main)]/50'}`}>Drop task di sini</div>}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-[var(--text-muted)] sm:hidden">Geser board ke samping untuk lihat kolom lain · tahan handle ⋮⋮ untuk drag kartu</p>
      </section>

      {/* floating ghost while pointer-dragging */}
      {draggedTask && ghostPos && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[60] w-56 rounded-md border border-[var(--accent-main)] bg-[var(--bg-surface)] p-2 text-[11px] font-bold text-[var(--text-bright)] shadow-2xl"
          style={{ left: ghostPos.x - 112, top: ghostPos.y - 20 }}
        >
          <span className="text-[var(--accent-purple)]">{draggedTask.id}</span> · {draggedTask.title.slice(0, 40)}
          {dropColumn && <span className="mt-1 block text-[10px] font-normal text-[var(--accent-main)]">→ {dropColumn.replace('_', ' ')}</span>}
        </div>
      )}
    </div>
  );
}
