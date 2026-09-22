'use client';

import { useTermFlowStore } from '@/lib/store';

export default function FocusStatusBar() {
  const { isPomodoroRunning, pomodoroMinutes, pomodoroSeconds, focusTaskId, tasks, stopFocus } = useTermFlowStore();
  if (!isPomodoroRunning || !focusTaskId) return null;
  const task = tasks.find((item) => item.id === focusTaskId);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--accent-cyan)]/40 bg-[var(--bg-app)]/95 px-3 py-1.5 font-mono text-[11px] text-[var(--accent-cyan)] shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <span className="truncate"><span className="mr-2 animate-pulse text-[var(--accent-main)]">●</span>FOCUS {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')} · {task?.id} {task?.title}</span>
        <button type="button" onClick={stopFocus} className="shrink-0 rounded border border-[var(--accent-red)]/60 px-2 py-0.5 text-[var(--accent-red)] transition hover:bg-[var(--accent-red)]/10">Stop</button>
      </div>
    </div>
  );
}
