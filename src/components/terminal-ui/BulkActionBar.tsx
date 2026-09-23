'use client';

import { useTermFlowStore, TaskPriority, TaskStatus } from '@/lib/store';
import { Trash2, X, SlidersHorizontal } from 'lucide-react';

export default function BulkActionBar({ ids, onClear }: { ids: string[]; onClear: () => void }) {
  const { bulkUpdateTasks, bulkDeleteTasks } = useTermFlowStore();
  if (ids.length === 0) return null;
  return (
    <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--accent-cyan)] bg-[var(--bg-surface)] p-3 text-xs shadow-xl">
      <div className="mr-auto flex items-center gap-1.5 font-bold text-[var(--accent-cyan)]">
        <SlidersHorizontal size={14} strokeWidth={1.75} aria-hidden />
        <span>{ids.length} selected</span>
      </div>
      <select aria-label="Bulk status" defaultValue="" onChange={(e) => { if (e.target.value) bulkUpdateTasks(ids, { status: e.target.value as TaskStatus }); }} className="terminal-input w-auto py-1">
        <option value="">Status...</option><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="review">Review</option><option value="done">Done</option>
      </select>
      <select aria-label="Bulk priority" defaultValue="" onChange={(e) => { if (e.target.value) bulkUpdateTasks(ids, { priority: e.target.value as TaskPriority }); }} className="terminal-input w-auto py-1">
        <option value="">Priority...</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
      </select>
      <button type="button" onClick={() => { if (confirm(`Delete ${ids.length} tasks?`)) { bulkDeleteTasks(ids); onClear(); } }} className="terminal-button inline-flex items-center gap-1.5 border-[var(--accent-red)] text-[var(--accent-red)]">
        <Trash2 size={13} strokeWidth={1.75} aria-hidden />
        <span>Delete</span>
      </button>
      <button type="button" onClick={onClear} className="terminal-button inline-flex items-center gap-1.5">
        <X size={13} strokeWidth={1.75} aria-hidden />
        <span>Clear</span>
      </button>
    </div>
  );
}
