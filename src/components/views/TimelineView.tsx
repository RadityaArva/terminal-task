'use client';

import { useMemo, useState } from 'react';
import { useTermFlowStore, Task } from '@/lib/store';
import CalendarEventBar from '../terminal-ui/CalendarEventBar';

const toKey = (date: Date) => date.toISOString().slice(0, 10);
const dateOnly = (value: string) => value.slice(0, 10);
const startOfDay = (value: string) => new Date(`${value}T00:00:00`);

interface TimelineViewProps {
  onSelectTask: (id: string) => void;
}

interface CalendarSegment {
  task: Task;
  startColumn: number;
  span: number;
  lane: number;
  isStart: boolean;
  isEnd: boolean;
}

function buildSegments(tasks: Task[], week: Date[]) {
  const weekStart = startOfDay(toKey(week[0]));
  const segments: CalendarSegment[] = [];
  const laneEnds: number[] = [];

  tasks.forEach((task) => {
    const start = startOfDay(dateOnly(task.startDate || task.createdAt));
    const end = startOfDay(dateOnly(task.endDate || task.dueDate));
    const rangeStart = start <= end ? start : end;
    const rangeEnd = start <= end ? end : start;
    const segmentStart = rangeStart < weekStart ? weekStart : rangeStart;
    const segmentEnd = rangeEnd > startOfDay(toKey(week[6])) ? startOfDay(toKey(week[6])) : rangeEnd;
    if (segmentStart > segmentEnd) return;

    const startColumn = Math.round((segmentStart.getTime() - weekStart.getTime()) / 86400000);
    const span = Math.round((segmentEnd.getTime() - segmentStart.getTime()) / 86400000) + 1;
    let lane = 0;
    while (laneEnds[lane] !== undefined && laneEnds[lane] >= startColumn) lane += 1;
    laneEnds[lane] = startColumn + span - 1;
    segments.push({
      task,
      startColumn,
      span,
      lane,
      isStart: rangeStart.getTime() === segmentStart.getTime(),
      isEnd: rangeEnd.getTime() === segmentEnd.getTime()
    });
  });
  return segments;
}

export default function TimelineView({ onSelectTask }: TimelineViewProps) {
  const { tasks, activeProjectId } = useTermFlowStore();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const projectTasks = tasks.filter((task) => task.projectId === activeProjectId && task.dueDate);
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [month]);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));
  const monthLabel = month.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const today = toKey(new Date());
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <section className="space-y-4 rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] p-3 font-mono text-xs shadow-md sm:p-4">
      <header className="flex flex-col gap-3 border-b border-[var(--border-main)] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="font-bold uppercase text-[var(--accent-cyan)]">&gt; calendar --multi-day</div><div className="mt-1 text-[10px] text-[var(--text-muted)]">{projectTasks.length} event · bar membentang dari start date sampai deadline</div></div>
        <div className="flex items-center justify-between gap-2 sm:justify-end"><button aria-label="Bulan sebelumnya" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="terminal-button">←</button><strong className="min-w-32 text-center capitalize text-[var(--text-bright)]">{monthLabel}</strong><button aria-label="Bulan berikutnya" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="terminal-button">→</button></div>
      </header>

      <div className="calendar-scroller -mx-1 overflow-x-auto px-1 pb-1">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-7 border-l border-t border-[var(--border-main)]/50">
            {dayNames.map((name) => <div key={name} className="border-b border-r border-[var(--border-main)]/50 bg-[var(--bg-app)] p-1.5 text-center font-bold text-[var(--text-muted)] sm:p-2">{name}</div>)}
          </div>
          {weeks.map((week) => {
            const segments = buildSegments(projectTasks, week);
            return (
              <div key={toKey(week[0])} className="relative grid min-h-28 grid-cols-7 border-l border-[var(--border-main)]/50">
                {week.map((day) => {
                  const key = toKey(day);
                  const currentMonth = day.getMonth() === month.getMonth();
                  return <div key={key} className={`min-h-28 overflow-hidden border-b border-r border-[var(--border-main)]/50 p-1 ${currentMonth ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-app)]/50 opacity-50'}`}><div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${key === today ? 'bg-[var(--accent-cyan)] font-bold text-[var(--bg-app)]' : 'text-[var(--text-muted)]'}`}>{day.getDate()}</div></div>;
                })}
                {segments.map((segment) => <CalendarEventBar key={`${segment.task.id}-${segment.startColumn}`} {...segment} onSelect={onSelectTask} />)}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {projectTasks.map((task) => <button key={task.id} onClick={() => onSelectTask(task.id)} className="rounded-md border border-[var(--border-main)]/60 bg-[var(--bg-app)] p-2.5 text-left transition hover:border-[var(--accent-cyan)]/70 hover:bg-[var(--bg-muted)]"><div className="font-bold text-[var(--text-bright)]">{task.title}</div><div className="mt-1 text-[10px] text-[var(--text-muted)]">{dateOnly(task.startDate || task.createdAt)} → {dateOnly(task.endDate || task.dueDate)}</div></button>)}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[var(--text-muted)]"><span><i className="mr-1 inline-block h-2 w-5 rounded bg-[var(--accent-cyan)] align-middle" />Berjalan</span><span><i className="mr-1 inline-block h-2 w-5 rounded bg-[var(--accent-main)] align-middle" />Selesai</span><span>Geser kalender di layar kecil</span></div>
    </section>
  );
}
