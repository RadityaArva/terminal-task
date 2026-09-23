'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTermFlowStore } from '@/lib/store';
import { CheckCircle2, ListTodo, FolderKanban, Timer, Clock, ChevronUp, X } from 'lucide-react';

export default function GlobalStatusBar() {
  const { tasks, projects, activeProjectId, isPomodoroRunning, pomodoroMinutes, pomodoroSeconds, setViewMode } = useTermFlowStore();
  const [time, setTime] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
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
    <>
      <div className="fixed bottom-0 left-0 right-0 z-30 flex min-h-7 items-center gap-2 border-t border-[var(--border-main)] bg-[var(--bg-surface)] px-3 py-1 text-[10px] leading-none text-[var(--text-muted)] supports-[backdrop-filter]:bg-[var(--bg-surface)]/95 supports-[backdrop-filter]:backdrop-blur-md sm:gap-3 sm:px-3 sm:py-1 sm:text-[10px]">
        <span className="flex shrink-0 items-center gap-1 text-[var(--accent-main)]">
          <CheckCircle2 size={12} strokeWidth={2} aria-hidden /> <span className="font-bold tracking-wide">synced</span>
        </span>

        {/* desktop/tablet: tampilkan semua info */}
        <button type="button" onClick={() => setViewMode('grid')} className="hidden shrink-0 items-center gap-1 hover:text-[var(--accent-cyan)] sm:flex">
          <ListTodo size={12} strokeWidth={1.75} aria-hidden />
          <span>tasks:</span>
          <motion.span key={active} initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}>{active}</motion.span>
        </button>
        <span className="hidden shrink-0 items-center gap-1 sm:flex">
          <FolderKanban size={12} strokeWidth={1.75} aria-hidden />
          <span className="max-w-[14rem] truncate">project:{project}</span>
        </span>
        {isPomodoroRunning && (
          <span className="hidden shrink-0 items-center gap-1 text-[var(--accent-yellow)] sm:flex">
            <Timer size={12} strokeWidth={1.75} aria-hidden />
            <span>focus:{String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}</span>
          </span>
        )}

        {/* mobile: focus badge ringkas jika ada */}
        {isPomodoroRunning && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--accent-yellow)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent-yellow)] sm:hidden">
            <Timer size={11} strokeWidth={2} aria-hidden /> {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
          </span>
        )}

        <time className="ml-auto flex shrink-0 items-center gap-1 tabular-nums text-[var(--accent-cyan)]">
          <Clock size={11} strokeWidth={1.75} aria-hidden />
          <span className="text-[11px] tracking-wide sm:text-[10px]">{time}</span>
        </time>

        {/* mobile: tombol buka detail status (tasks + project) */}
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          aria-expanded={detailsOpen}
          aria-label={detailsOpen ? 'Tutup detail status' : 'Buka detail status'}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border-main)]/50 bg-[var(--bg-app)] text-[var(--text-muted)] hover:border-[var(--accent-cyan)]/40 hover:text-[var(--text-bright)] sm:hidden"
        >
          {detailsOpen ? <X size={12} strokeWidth={2} aria-hidden /> : <ChevronUp size={12} strokeWidth={2} aria-hidden />}
        </button>
      </div>

      <AnimatePresence>
        {detailsOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Tutup detail status"
              onClick={() => setDetailsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] sm:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.22, 0.8, 0.24, 1] }}
              className="fixed bottom-8 left-2 right-2 z-30 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-3 shadow-2xl sm:hidden"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Status</span>
                <button type="button" onClick={() => setDetailsOpen(false)} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)]" aria-label="Tutup">
                  <X size={14} strokeWidth={2} aria-hidden />
                </button>
              </div>
              <div className="grid gap-2 text-xs">
                <button type="button" onClick={() => { setDetailsOpen(false); setViewMode('grid'); }} className="flex min-h-[44px] items-center gap-2 rounded-lg border border-[var(--border-main)]/50 bg-[var(--bg-app)] px-3 text-left hover:border-[var(--accent-cyan)]/40">
                  <ListTodo size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-[var(--accent-cyan)]" />
                  <span className="flex-1">Tasks aktif</span>
                  <span className="rounded-full bg-[var(--bg-muted)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--text-bright)]">{active}</span>
                </button>
                <div className="flex min-h-[44px] items-center gap-2 rounded-lg border border-[var(--border-main)]/40 bg-[var(--bg-app)] px-3">
                  <FolderKanban size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-[var(--text-muted)]" />
                  <span className="min-w-0 flex-1 truncate">Project: <span className="font-bold text-[var(--text-bright)]">{project}</span></span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
