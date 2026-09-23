'use client';

import { useMemo } from 'react';
import { useTermFlowStore } from '@/lib/store';
import { CalendarCheck, X } from 'lucide-react';

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (dateKey: string, days: number) => {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeeklyReviewModal({ isOpen, onClose }: WeeklyReviewModalProps) {
  const { tasks, updateTask } = useTermFlowStore();
  const today = new Date();
  const todayKey = toDateKey(today);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartKey = toDateKey(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekEndKey = toDateKey(weekEnd);

  const review = useMemo(() => {
    const thisWeek = tasks.filter((task) => {
      const activityDate = task.completedAt?.slice(0, 10) || task.createdAt.slice(0, 10);
      return activityDate >= weekStartKey && activityDate <= weekEndKey;
    });
    const completed = thisWeek.filter((task) => task.status === 'done');
    const overdue = tasks.filter((task) => task.status !== 'done' && task.dueDate && task.dueDate < todayKey);
    return { thisWeek, completed, overdue };
  }, [tasks, todayKey, weekStartKey, weekEndKey]);

  if (!isOpen) return null;

  return (
    <div className="terminal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <section className="terminal-modal w-full max-w-2xl overflow-hidden rounded-lg border-2 border-[var(--border-main)] bg-[var(--bg-surface)] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-[var(--border-main)] bg-[var(--bg-app)] px-4 py-3">
          <div>
            <div className="font-bold text-[var(--accent-cyan)]">&gt; review week</div>
            <div className="mt-1 text-[10px] text-[var(--text-muted)]">{weekStartKey} → {weekEndKey}</div>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-bright)]" aria-label="Tutup weekly review"><X size={16} strokeWidth={1.75} aria-hidden /></button>
        </header>
        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-4 text-xs">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <SummaryCard label="Task minggu ini" value={review.thisWeek.length} color="cyan" />
            <SummaryCard label="Selesai" value={review.completed.length} color="main" />
            <SummaryCard label="Belum selesai" value={review.thisWeek.length - review.completed.length} color="yellow" />
          </div>
          <section className="rounded border border-[var(--accent-red)]/40 bg-[var(--accent-red)]/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold text-[var(--accent-red)]">OVERDUE ({review.overdue.length})</h3>
              <span className="text-[10px] text-[var(--text-muted)]">Status belum Done</span>
            </div>
            {review.overdue.length === 0 ? <p className="text-[var(--text-muted)]">Tidak ada task overdue.</p> : <div className="space-y-2">{review.overdue.map((task) => <div key={task.id} className="flex flex-col gap-2 rounded border border-[var(--border-main)]/60 bg-[var(--bg-app)] p-2 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="truncate font-bold text-[var(--text-bright)]">{task.title}</div><div className="text-[10px] text-[var(--accent-red)]">{task.id} · deadline {task.dueDate}</div></div><button type="button" onClick={() => updateTask(task.id, { dueDate: addDays(task.dueDate, 7), endDate: addDays(task.endDate || task.dueDate, 7) })} className="terminal-button shrink-0 text-[10px] text-[var(--accent-cyan)]">+7 hari</button></div>)}</div>}
          </section>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: 'cyan' | 'main' | 'yellow' }) {
  return <div className="rounded border border-[var(--border-main)] bg-[var(--bg-app)] p-3"><div className={`text-xl font-bold text-[var(--accent-${color})]`}>{value}</div><div className="mt-1 text-[10px] uppercase text-[var(--text-muted)]">{label}</div></div>;
}
