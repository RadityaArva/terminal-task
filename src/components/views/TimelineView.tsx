'use client';

import { useMemo, useState } from 'react';
import { useTermFlowStore } from '@/lib/store';

interface TimelineViewProps {
  onSelectTask: (id: string) => void;
}

const toKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function TimelineView({ onSelectTask }: TimelineViewProps) {
  const { tasks, activeProjectId } = useTermFlowStore();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const projectTasks = tasks.filter((task) => task.projectId === activeProjectId && task.dueDate);
  const days = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(firstDay);
    start.setDate(1 - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [month]);
  const tasksByDate = new Map<string, typeof projectTasks>();
  projectTasks.forEach((task) => tasksByDate.set(task.dueDate, [...(tasksByDate.get(task.dueDate) || []), task]));
  const monthLabel = month.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <section className="space-y-4 rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] p-3 font-mono text-xs shadow-md sm:p-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-main)] pb-3">
        <div><div className="font-bold uppercase text-[var(--accent-cyan)]">&gt; calendar --month</div><div className="mt-1 text-[10px] text-[var(--text-muted)]">{projectTasks.length} deadline terjadwal</div></div>
        <div className="flex items-center gap-2"><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="terminal-button">←</button><strong className="min-w-36 text-center capitalize text-[var(--text-bright)]">{monthLabel}</strong><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="terminal-button">→</button></div>
      </header>
      <div className="min-w-[680px] overflow-x-auto">
        <div className="grid grid-cols-7 border-l border-t border-[var(--border-main)]/50">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => <div key={day} className="border-b border-r border-[var(--border-main)]/50 bg-[var(--bg-app)] p-2 text-center font-bold text-[var(--text-muted)]">{day}</div>)}
          {days.map((day) => {
            const key = toKey(day);
            const dayTasks = tasksByDate.get(key) || [];
            const isCurrentMonth = day.getMonth() === month.getMonth();
            const isToday = key === toKey(new Date());
            return (
              <div key={key} className={`min-h-28 border-b border-r border-[var(--border-main)]/50 p-1.5 ${isCurrentMonth ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-app)]/50 opacity-50'}`}>
                <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${isToday ? 'bg-[var(--accent-cyan)] font-bold text-[var(--bg-app)]' : 'text-[var(--text-muted)]'}`}>{day.getDate()}</div>
                <div className="space-y-1">
                  {dayTasks.map((task) => <button key={task.id} onClick={() => onSelectTask(task.id)} className={`block w-full truncate rounded border px-1.5 py-1 text-left text-[10px] font-bold ${task.status === 'done' ? 'border-[var(--accent-main)]/50 bg-[var(--accent-main)]/20 text-[var(--accent-main)]' : 'border-[var(--accent-yellow)]/50 bg-[var(--accent-yellow)]/15 text-[var(--accent-yellow)]'}`} title={task.title}>[{task.dueTime || '--:--'}] {task.title}</button>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
