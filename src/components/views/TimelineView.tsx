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
  const weekEnd = startOfDay(toKey(week[6]));
  const segments: CalendarSegment[] = [];
  const laneEnds: number[] = [];

  // sort by start date for deterministic lane assignment
  const sorted = [...tasks].sort((a, b) => {
    const sa = startOfDay(dateOnly(a.startDate || a.createdAt)).getTime();
    const sb = startOfDay(dateOnly(b.startDate || b.createdAt)).getTime();
    if (sa !== sb) return sa - sb;
    return (a.endDate || a.dueDate).localeCompare(b.endDate || b.dueDate);
  });

  sorted.forEach((task) => {
    const start = startOfDay(dateOnly(task.startDate || task.createdAt));
    const end = startOfDay(dateOnly(task.endDate || task.dueDate));
    const rangeStart = start <= end ? start : end;
    const rangeEnd = start <= end ? end : start;
    const segmentStart = rangeStart < weekStart ? weekStart : rangeStart;
    const segmentEnd = rangeEnd > weekEnd ? weekEnd : rangeEnd;
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
      isEnd: rangeEnd.getTime() === segmentEnd.getTime(),
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

  // mobile agenda: group tasks by day key within visible month
  const agendaByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    // include tasks that overlap the month
    projectTasks.forEach((task) => {
      const s = dateOnly(task.startDate || task.createdAt);
      const e = dateOnly(task.endDate || task.dueDate);
      const start = s <= e ? s : e;
      const end = s <= e ? e : s;
      // iterate days of task range that fall within month
      const cur = startOfDay(start);
      const endD = startOfDay(end);
      for (let d = new Date(cur); d <= endD; d.setDate(d.getDate() + 1)) {
        const k = toKey(d);
        if (!k.startsWith(monthStr)) continue;
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(task);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [projectTasks, month]);

  return (
    <section className="space-y-4 rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] p-3 font-mono text-xs shadow-md sm:p-4">
      <header className="flex flex-col gap-3 border-b border-[var(--border-main)] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-bold uppercase text-[var(--accent-cyan)]">&gt; calendar --multi-day</div>
          <div className="mt-1 text-[10px] text-[var(--text-muted)]">{projectTasks.length} event · bar membentang dari start → deadline · overlap di-stack vertikal</div>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button aria-label="Bulan sebelumnya" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="terminal-button">←</button>
          <strong className="min-w-32 text-center capitalize text-[var(--text-bright)]">{monthLabel}</strong>
          <button aria-label="Bulan berikutnya" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="terminal-button">→</button>
        </div>
      </header>

      {/* desktop/tablet: grid calendar with proper stacking */}
      <div className="calendar-scroller hidden overflow-x-auto pb-1 sm:block">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-7 border-l border-t border-[var(--border-main)]/50">
            {dayNames.map((name) => (
              <div key={name} className="border-b border-r border-[var(--border-main)]/50 bg-[var(--bg-app)] p-1.5 text-center font-bold text-[var(--text-muted)] sm:p-2">{name}</div>
            ))}
          </div>
          {weeks.map((week) => {
            const segments = buildSegments(projectTasks, week);
            const maxLane = segments.reduce((m, s) => Math.max(m, s.lane), -1);
            // dynamic row height: base 56px (day number + padding) + lanes*27px
            const rowH = maxLane >= 0 ? Math.max(112, 52 + (maxLane + 1) * 27 + 12) : 112;
            return (
              <div key={toKey(week[0])} className="relative grid grid-cols-7 border-l border-[var(--border-main)]/50" style={{ minHeight: rowH }}>
                {week.map((day) => {
                  const key = toKey(day);
                  const currentMonth = day.getMonth() === month.getMonth();
                  return (
                    <div
                      key={key}
                      className={`overflow-hidden border-b border-r border-[var(--border-main)]/50 p-1 ${currentMonth ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-app)]/50 opacity-50'}`}
                      style={{ minHeight: rowH }}
                    >
                      <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${key === today ? 'bg-[var(--accent-cyan)] font-bold text-[var(--bg-app)]' : 'text-[var(--text-muted)]'}`}>{day.getDate()}</div>
                    </div>
                  );
                })}
                {segments.map((segment) => (
                  <CalendarEventBar key={`${segment.task.id}-${segment.startColumn}-${segment.lane}`} {...segment} onSelect={onSelectTask} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* mobile: agenda list per hari — no horizontal scroll, no stacking overlap */}
      <div className="space-y-3 sm:hidden">
        {agendaByDay.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border-main)]/50 bg-[var(--bg-app)] p-6 text-center text-[11px] text-[var(--text-muted)]">Tidak ada task di bulan ini.</div>
        ) : (
          agendaByDay.map(([dayKey, dayTasks]) => {
            const d = new Date(`${dayKey}T00:00:00`);
            const isToday = dayKey === today;
            const label = d.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short' });
            return (
              <div key={dayKey} className="overflow-hidden rounded-lg border border-[var(--border-main)]/40 bg-[var(--bg-app)]">
                <div className={`flex items-center gap-2 border-b px-3 py-2 text-[11px] font-bold ${isToday ? 'border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]' : 'border-[var(--border-main)]/30 bg-[var(--bg-muted)]/40 text-[var(--text-muted)]'}`}>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${isToday ? 'bg-[var(--accent-cyan)]' : 'bg-[var(--border-main)]'}`} aria-hidden />
                  <span className="capitalize">{label}</span>
                  <span className="ml-auto rounded-full bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px] font-bold">{dayTasks.length}</span>
                </div>
                <div className="space-y-1.5 p-2">
                  {dayTasks.map((task) => {
                    const complete = task.status === 'done';
                    return (
                      <button
                        key={`${dayKey}-${task.id}`}
                        type="button"
                        onClick={() => onSelectTask(task.id)}
                        className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-2.5 text-left transition ${complete ? 'border-[var(--accent-main)]/30 bg-[var(--accent-main)]/10 text-[var(--accent-main)]' : 'border-[var(--border-main)]/40 bg-[var(--bg-surface)] text-[var(--text-bright)] hover:border-[var(--accent-cyan)]/40'}`}
                      >
                        <span className={`h-2 w-8 shrink-0 rounded ${complete ? 'bg-[var(--accent-main)]' : 'bg-[var(--accent-cyan)]'}`} aria-hidden />
                        <span className="min-w-0 flex-1 truncate text-xs font-bold leading-tight">{task.title}</span>
                        <span className="shrink-0 font-mono text-[10px] text-[var(--text-muted)]">{task.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[var(--text-muted)]">
        <span><i className="mr-1 inline-block h-2 w-5 rounded bg-[var(--accent-cyan)] align-middle" />Berjalan</span>
        <span><i className="mr-1 inline-block h-2 w-5 rounded bg-[var(--accent-main)] align-middle" />Selesai</span>
        <span className="hidden sm:inline">Geser kalender di layar kecil · bar multi-hari memanjang dan lanjut ke minggu berikut</span>
        <span className="sm:hidden">Agenda per hari di HP — tanpa geser horizontal</span>
      </div>
    </section>
  );
}
