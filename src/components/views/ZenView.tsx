'use client';

import { useTermFlowStore } from '@/lib/store';
import { Play, Pause, RotateCcw, X, Sparkles, CheckCircle2, ListTodo } from 'lucide-react';

export default function ZenView() {
  const {
    tasks,
    activeProjectId,
    zenTaskId,
    setZenTask,
    pomodoroMinutes,
    pomodoroSeconds,
    isPomodoroRunning,
    pomodoroMode,
    startFocus,
    stopFocus,
    resetPomodoro,
    toggleSubtask,
    setViewMode,
  } = useTermFlowStore();

  const projectTasks = tasks.filter((t) => t.projectId === activeProjectId);
  const activeTask = tasks.find((t) => t.id === zenTaskId) || projectTasks[0];

  const formattedMin = String(pomodoroMinutes).padStart(2, '0');
  const formattedSec = String(pomodoroSeconds).padStart(2, '0');

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-4 font-mono sm:gap-6">
      {/* Exit Button — always visible, prominent in the top corner */}
      <div className="flex items-center justify-between border-b border-[var(--border-main)]/60 bg-[var(--bg-surface)]/60 px-3 py-2 rounded-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-purple)]">
          <Sparkles size={14} strokeWidth={1.75} aria-hidden />
          <span>ZEN / FOCUS MODE</span>
        </div>
        <button
          type="button"
          onClick={() => setViewMode('board')}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[var(--border-main)] bg-[var(--bg-app)] px-3 py-1.5 text-xs font-bold text-[var(--text-bright)] transition hover:border-[var(--accent-red)]/60 hover:text-[var(--accent-red)]"
          aria-label="Keluar dari Zen Mode"
          title="Kembali ke Board"
        >
          <X size={14} strokeWidth={2} aria-hidden />
          <span>Keluar (Exit)</span>
        </button>
      </div>

      {/* Main Focus Card — perfectly centered timer & controls, fit in viewport */}
      <div className="terminal-panel flex flex-col items-center justify-center p-5 text-center sm:p-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--border-main)] bg-[var(--bg-app)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--accent-cyan)]">
          <span className={`h-2 w-2 rounded-full ${isPomodoroRunning ? 'animate-pulse bg-[var(--accent-main)]' : 'bg-[var(--accent-yellow)]'}`} aria-hidden />
          {pomodoroMode === 'work' ? '🔥 Focus Session' : '☕ Rest Break'}
        </div>

        {/* Task target selector */}
        <div className="mt-2 w-full max-w-md">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Target Task</label>
          <select
            value={activeTask?.id || ''}
            onChange={(e) => setZenTask(e.target.value)}
            className="terminal-input w-full py-2 text-center text-xs font-bold text-[var(--accent-cyan)] sm:text-sm"
          >
            {projectTasks.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.id}] {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Big centered Timer display — proportional, readable from arm's length */}
        <div className="my-5 flex flex-col items-center justify-center sm:my-8">
          <div className="font-mono text-6xl font-black tracking-widest text-[var(--accent-main)] drop-shadow-lg sm:text-7xl md:text-8xl">
            {formattedMin}:{formattedSec}
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)] sm:text-sm">
            {isPomodoroRunning ? 'Timer berjalan... Tetap fokus pada task ini.' : 'Timer dijeda. Siap untuk mulai?'}
          </p>
        </div>

        {/* Controls row — Play/Pause + Reset with consistent icons & touch target */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isPomodoroRunning) stopFocus();
              else if (activeTask) startFocus(activeTask.id, 25);
            }}
            className={`inline-flex min-h-[44px] min-w-[140px] items-center justify-center gap-2 rounded-lg px-6 py-3 text-xs font-bold text-[var(--bg-app)] shadow-lg transition sm:text-sm ${
              isPomodoroRunning
                ? 'bg-[var(--accent-yellow)] hover:opacity-90'
                : 'bg-[var(--accent-main)] hover:bg-[var(--accent-hover)]'
            }`}
          >
            {isPomodoroRunning ? (
              <>
                <Pause size={16} strokeWidth={2} aria-hidden />
                <span>Jeda / Pause</span>
              </>
            ) : (
              <>
                <Play size={16} strokeWidth={2} aria-hidden />
                <span>Mulai Fokus</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              if (isPomodoroRunning) stopFocus();
              resetPomodoro();
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--border-main)] bg-[var(--bg-app)] px-4 py-3 text-xs font-bold text-[var(--text-muted)] transition hover:border-[var(--accent-cyan)] hover:text-[var(--text-bright)] sm:text-sm"
          >
            <RotateCcw size={15} strokeWidth={2} aria-hidden />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Task Checklist card */}
      {activeTask && (
        <div className="terminal-panel space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-[var(--border-main)]/60 pb-2">
            <h3 className="flex items-center gap-2 text-xs font-bold text-[var(--text-bright)]">
              <ListTodo size={14} strokeWidth={1.75} className="text-[var(--accent-cyan)]" aria-hidden />
              <span>Checklist: {activeTask.title}</span>
            </h3>
            <span className="font-mono text-xs font-bold text-[var(--accent-purple)]">[{activeTask.id}]</span>
          </div>

          {activeTask.description && (
            <p className="rounded border border-[var(--border-main)]/40 bg-[var(--bg-app)] p-2.5 text-xs text-[var(--text-muted)]">
              {activeTask.description}
            </p>
          )}

          <div className="space-y-1.5 text-xs">
            {activeTask.subtasks.map((st) => (
              <label
                key={st.id}
                className="flex min-h-[40px] cursor-pointer items-center gap-3 rounded border border-[var(--border-main)]/50 bg-[var(--bg-app)] p-2.5 transition hover:border-[var(--accent-cyan)]/40"
              >
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => toggleSubtask(activeTask.id, st.id)}
                  className="h-4 w-4 accent-[var(--accent-main)]"
                />
                <span className={st.completed ? 'text-[var(--text-muted)] line-through' : 'font-semibold text-[var(--text-bright)]'}>
                  {st.title}
                </span>
              </label>
            ))}

            {activeTask.subtasks.length === 0 && (
              <div className="py-3 text-center text-xs text-[var(--text-muted)]">
                Belum ada subtask checklist. Fokus pada task utama di atas!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
