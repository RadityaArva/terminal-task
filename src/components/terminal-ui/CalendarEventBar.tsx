'use client';

import type { Task } from '@/lib/store';

interface CalendarEventBarProps {
  task: Task;
  startColumn: number;
  span: number;
  lane: number;
  isStart: boolean;
  isEnd: boolean;
  onSelect: (id: string) => void;
}

export default function CalendarEventBar({
  task,
  startColumn,
  span,
  lane,
  isStart,
  isEnd,
  onSelect
}: CalendarEventBarProps) {
  const complete = task.status === 'done';
  return (
    <button
      type="button"
      onClick={() => onSelect(task.id)}
      title={`${task.title} · ${task.startDate || task.createdAt.slice(0, 10)} → ${task.endDate || task.dueDate}`}
      className={`calendar-event-bar absolute z-10 h-6 -translate-y-1/2 truncate px-2 text-left text-[10px] font-bold shadow-sm transition hover:brightness-125 focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-[var(--accent-cyan)] ${isStart ? 'rounded-l-md' : ''} ${isEnd ? 'rounded-r-md' : ''} ${complete ? 'bg-[var(--accent-main)] text-[var(--bg-app)]' : 'bg-[var(--accent-cyan)] text-[var(--bg-app)]'}`}
      style={{
        left: `${(startColumn / 7) * 100}%`,
        width: `${(span / 7) * 100}%`,
        top: `${lane * 27 + 48}px`
      }}
    >
      <span className="block truncate">{isStart ? task.title : '\u00a0'}</span>
    </button>
  );
}
