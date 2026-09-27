'use client';

import { useTermFlowStore, TaskPriority, TaskStatus } from '@/lib/store';
import { Trash2, X, SlidersHorizontal } from 'lucide-react';
import CustomSelect from '@/components/terminal-ui/CustomSelect';

export default function BulkActionBar({ ids, onClear }: { ids: string[]; onClear: () => void }) {
  const { bulkUpdateTasks, bulkDeleteTasks } = useTermFlowStore();
  if (ids.length === 0) return null;
  return (
    <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--accent-cyan)] bg-[var(--bg-surface)] p-3 text-xs shadow-xl">
      <div className="mr-auto flex items-center gap-1.5 font-bold text-[var(--accent-cyan)]">
        <SlidersHorizontal size={14} strokeWidth={1.75} aria-hidden />
        <span>{ids.length} selected</span>
      </div>
      <CustomSelect value="" onChange={(v) => { if (v) bulkUpdateTasks(ids, { status: v as TaskStatus }); }} options={[{ value: "", label: "Status…" }, { value: "todo", label: "To Do" }, { value: "in_progress", label: "In Progress" }, { value: "review", label: "Review" }, { value: "done", label: "Done" }]} ariaLabel="Bulk status" className="w-auto min-w-[124px]" triggerClassName="py-1 text-xs" />
      <CustomSelect value="" onChange={(v) => { if (v) bulkUpdateTasks(ids, { priority: v as TaskPriority }); }} options={[{ value: "", label: "Priority…" }, { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent" }]} ariaLabel="Bulk priority" className="w-auto min-w-[120px]" triggerClassName="py-1 text-xs" />
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
