'use client';

import { useTermFlowStore } from '@/lib/store';
import { Sparkles, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

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
    toggleSubtask
  } = useTermFlowStore();

  const projectTasks = tasks.filter((t) => t.projectId === activeProjectId);
  const activeTask = tasks.find((t) => t.id === zenTaskId) || projectTasks[0];

  const formattedMin = String(pomodoroMinutes).padStart(2, '0');
  const formattedSec = String(pomodoroSeconds).padStart(2, '0');

  return (
    <div className="max-w-2xl mx-auto font-mono space-y-6 animate-in fade-in duration-200">
      {/* Zen Header Card */}
      <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-main)] rounded-lg p-6 shadow-xl text-center space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pb-2 border-b border-[var(--border-main)]">
          <span className="text-[var(--accent-purple)] font-bold">🧘 ZEN FOCUS MODE</span>
          <span className="uppercase text-[var(--accent-cyan)] font-bold">
            {pomodoroMode === 'work' ? '🔥 Focus Session' : '☕ Rest Break'}
          </span>
        </div>

        {/* Task Selector */}
        <div className="space-y-1">
          <label className="text-[11px] text-[var(--text-muted)] block">FOCUS TASK TARGET</label>
          <select
            value={activeTask?.id || ''}
            onChange={(e) => setZenTask(e.target.value)}
            className="w-full max-w-md bg-[var(--bg-app)] border border-[var(--border-main)] text-[var(--accent-cyan)] font-bold rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent-cyan)] text-center"
          >
            {projectTasks.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.id}] {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Large Pomodoro Timer Display */}
        <div className="py-6">
          <div className="text-6xl sm:text-7xl font-bold tracking-widest text-[var(--accent-main)] font-mono drop-shadow-md">
            {formattedMin}:{formattedSec}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {isPomodoroRunning ? 'Timer ticking... Stay focused!' : 'Timer paused. Ready to work?'}
          </p>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex justify-center space-x-3 pt-2">
          <button
            onClick={() => {
              if (isPomodoroRunning) stopFocus();
              else if (activeTask) startFocus(activeTask.id, 25);
            }}
            className={`px-6 py-2.5 rounded font-bold text-sm text-[var(--bg-app)] transition-all shadow-md ${
              isPomodoroRunning
                ? 'bg-[var(--accent-yellow)] hover:opacity-90'
                : 'bg-[var(--accent-main)] hover:bg-[var(--accent-hover)]'
            }`}
          >
            {isPomodoroRunning ? '⏸ <Pause size={14} className="mr-1.5 inline" aria-hidden /> Jeda / Pause' : '▶ <Play size={14} className="mr-1.5 inline" aria-hidden /> Mulai Focus'}
          </button>
          <button
            onClick={() => {
              if (isPomodoroRunning) stopFocus();
              resetPomodoro();
            }}
            className="px-4 py-2.5 rounded bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-bright)] border border-[var(--border-main)] font-bold text-sm transition-colors"
          >
            🔄 <RotateCcw size={14} className="mr-1.5 inline" aria-hidden /> Reset
          </button>
        </div>
      </div>

      {/* Active Task Checklist Focus */}
      {activeTask && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg p-5 shadow-md space-y-3">
          <h4 className="font-bold text-sm text-[var(--text-bright)] flex items-center justify-between">
            <span>TASK CHECKLIST: {activeTask.title}</span>
            <span className="text-xs text-[var(--accent-purple)]">[{activeTask.id}]</span>
          </h4>

          {activeTask.description && (
            <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-app)] p-3 rounded border border-[var(--border-main)]/50">
              {activeTask.description}
            </p>
          )}

          <div className="space-y-2 pt-1 text-xs">
            {activeTask.subtasks.map((st) => (
              <label
                key={st.id}
                className="flex items-center space-x-3 p-2 rounded bg-[var(--bg-app)] border border-[var(--border-main)] cursor-pointer hover:border-[var(--accent-cyan)] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => toggleSubtask(activeTask.id, st.id)}
                  className="accent-[var(--accent-main)] w-4 h-4"
                />
                <span className={`${st.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-bright)] font-semibold'}`}>
                  {st.title}
                </span>
              </label>
            ))}

            {activeTask.subtasks.length === 0 && (
              <div className="text-xs text-[var(--text-muted)] text-center py-3">
                No checklist subtasks. Focus on the main title task above!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
