'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTermFlowStore } from '@/lib/store';
import { CheckCircle2, ListTodo, FolderKanban, Timer, Clock } from 'lucide-react';

export default function GlobalStatusBar() {
  const { tasks, projects, activeProjectId, isPomodoroRunning, pomodoroMinutes, pomodoroSeconds, setViewMode } = useTermFlowStore();
  const [time, setTime] = useState('');
  const shouldReduceMotion = useReducedMotion();
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const active = tasks.filter((task) => task.status !== 'done').length;
  const project = projects.find((item) => item.id === activeProjectId)?.name || 'Workspace';
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex min-h-7 items-center gap-3 overflow-x-auto border-t border-[var(--border-main)] bg-[var(--bg-surface)] px-3 py-1 text-[10px] text-[var(--text-muted)]">
      <span className="flex shrink-0 items-center gap-1 text-[var(--accent-main)]">
        <CheckCircle2 size={12} strokeWidth={2} aria-hidden /> synced
      </span>
      <button type="button" onClick={() => setViewMode('grid')} className="flex shrink-0 items-center gap-1 hover:text-[var(--accent-cyan)]">
        <ListTodo size={12} strokeWidth={1.75} aria-hidden />
        <span>tasks:</span>
        <motion.span key={active} initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}>{active}</motion.span>
      </button>
      <span className="flex shrink-0 items-center gap-1">
        <FolderKanban size={12} strokeWidth={1.75} aria-hidden />
        <span>project:{project}</span>
      </span>
      {isPomodoroRunning && (
        <span className="flex shrink-0 items-center gap-1 text-[var(--accent-yellow)]">
          <Timer size={12} strokeWidth={1.75} aria-hidden />
          <span>focus:{String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}</span>
        </span>
      )}
      <time className="ml-auto flex shrink-0 items-center gap-1 tabular-nums text-[var(--accent-cyan)]">
        <Clock size={11} strokeWidth={1.75} aria-hidden />
        <span>{time}</span>
      </time>
    </div>
  );
}
