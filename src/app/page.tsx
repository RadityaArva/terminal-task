'use client';

import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTermFlowStore } from '@/lib/store';
import { applyTheme } from '@/lib/themes';
import Header from '@/components/terminal-ui/Header';
import CommandPalette from '@/components/terminal-ui/CommandPalette';
import ShortcutCheatsheet from '@/components/terminal-ui/ShortcutCheatsheet';
import TerminalLogView from '@/components/terminal-ui/TerminalLogView';

import BoardView from '@/components/views/BoardView';
import GridView from '@/components/views/GridView';
import TimelineView from '@/components/views/TimelineView';
import GraphView from '@/components/views/GraphView';
import MissionControlView from '@/components/views/MissionControlView';
import AnalyticsView from '@/components/views/AnalyticsView';
import NewProjectModal from '@/components/terminal-ui/NewProjectModal';
import ZenView from '@/components/views/ZenView';
import ProfileView from '@/components/views/ProfileView';
import InboxView from '@/components/views/InboxView';
import NotesDashboard from '@/components/views/NotesDashboard';

import TaskDetailModal from '@/components/task/TaskDetailModal';
import LoginGate from '@/components/auth/LoginGate';
import DeadlineNotice from '@/components/terminal-ui/DeadlineNotice';
import FocusStatusBar from '@/components/terminal-ui/FocusStatusBar';
import WeeklyReviewModal from '@/components/terminal-ui/WeeklyReviewModal';
import QuickCaptureModal from '@/components/terminal-ui/QuickCaptureModal';
import GlobalStatusBar from '@/components/terminal-ui/GlobalStatusBar';
import StandupReportModal from '@/components/terminal-ui/StandupReportModal';

export default function Home() {
  const {
    viewMode,
    setViewMode,
    themeId,
    glassCustomBg,
    glassCustomImage,
    tasks,
    activeProjectId,
    selectedTaskId,
    setSelectedTaskId,
    searchFilter,
    setSearchFilter,
    setThemeId,
    setLang,
    purgeExpiredTasks,
    isPomodoroRunning,
    tickPomodoro
  } = useTermFlowStore();
  const isAuthenticated = useTermFlowStore((state) => state.isAuthenticated);

  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'today' | 'week' | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [gKeyPressed, setGKeyPressed] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const shouldReduceMotion = useReducedMotion();

  const commands = useMemo(() => [
    {
      id: 'start-focus',
      label: 'Start focus',
      description: 'Mulai sesi deep work 25 menit pada task terpilih',
      shortcut: 'start focus',
      execute: () => {
        if (selectedTaskId) useTermFlowStore.getState().startFocus(selectedTaskId, 25);
      }
    },
    {
      id: 'capture',
      label: 'Capture task to Inbox',
      description: 'Buat task cepat tanpa mengisi detail proyek',
      shortcut: 'capture',
      execute: () => setIsQuickCaptureOpen(true)
    },
    {
      id: 'filter-energy-high',
      label: 'Filter energy:high',
      description: 'Tampilkan task dengan kebutuhan energi tinggi',
      execute: () => setSearchFilter('energy:high')
    },
    {
      id: 'view-inbox',
      label: 'Open Inbox',
      description: 'Sortir task yang belum memiliki proyek',
      shortcut: 'g i',
      execute: () => setViewMode('inbox')
    },
    {
      id: 'review-week',
      label: 'Review week',
      description: 'Ringkasan task mingguan dan task overdue',
      shortcut: 'review week',
      execute: () => setIsWeeklyReviewOpen(true)
    },
    {
      id: 'report-today',
      label: 'Report today',
      description: 'Buat ringkasan Markdown untuk hari ini',
      execute: () => setReportPeriod('today')
    },
    {
      id: 'report-week',
      label: 'Report week',
      description: 'Buat ringkasan Markdown minggu ini',
      execute: () => setReportPeriod('week')
    },
    {
      id: 'view-board',
      label: 'Open board view',
      description: 'Switch to the kanban board',
      shortcut: 'g d',
      execute: () => setViewMode('board')
    },
    {
      id: 'view-grid',
      label: 'Open grid view',
      description: 'Switch to the task table',
      execute: () => setViewMode('grid')
    },
    {
      id: 'view-timeline',
      label: 'Open timeline view',
      description: 'Switch to the project timeline',
      execute: () => setViewMode('timeline')
    },
    {
      id: 'view-graph',
      label: 'Open dependency graph',
      description: 'Visualize task dependencies for the active project',
      shortcut: 'view graph',
      execute: () => setViewMode('graph')
    },
    {
      id: 'focus-mission-control',
      label: 'Focus mission control',
      description: 'Buka task prioritas tinggi dari semua project',
      execute: () => setViewMode('mission')
    },
    {
      id: 'view-analytics',
      label: 'Open burndown and velocity',
      description: 'Lihat grafik burndown dan velocity project aktif',
      shortcut: 'view analytics',
      execute: () => setViewMode('analytics')
    },
    {
      id: 'new-project',
      label: 'New project',
      description: 'Buat project baru dengan akses user dan role',
      shortcut: 'new project',
      execute: () => setIsNewProjectOpen(true)
    },
    {
      id: 'new-note',
      label: 'New note "judul"',
      description: 'Buat catatan Markdown baru di dashboard Notes',
      shortcut: 'new note',
      execute: () => { useTermFlowStore.getState().addNote({ title: 'Untitled note' }); setNewNoteTitle(String(Date.now())); setViewMode('notes'); }
    },
    {
      id: 'goto-notes',
      label: 'Go to notes',
      description: 'Buka dashboard catatan',
      shortcut: 'goto notes',
      execute: () => setViewMode('notes')
    },
    {
      id: 'view-zen',
      label: 'Open zen mode',
      description: 'Focus on one task with Pomodoro',
      execute: () => setViewMode('zen')
    },
    {
      id: 'view-profile',
      label: 'Open profile',
      description: 'View profile and activity',
      shortcut: 'g p',
      execute: () => setViewMode('profile')
    },
    {
      id: 'clear-filter',
      label: 'Clear search filter',
      description: 'Show all tasks in the active project',
      execute: () => setSearchFilter('')
    },
    {
      id: 'language-id',
      label: 'Use Indonesian',
      description: 'Change the interface language to Indonesian',
      execute: () => setLang('id')
    },
    {
      id: 'language-en',
      label: 'Use English',
      description: 'Change the interface language to English',
      execute: () => setLang('en')
    },
    ...(['github-dark', 'github-light', 'dracula', 'nord', 'solarized', 'monokai', 'dimmed', 'high-contrast'] as const).map((id) => ({
      id: `theme-${id}`,
      label: `Use ${id} theme`,
      description: 'Change the terminal color theme',
      execute: () => setThemeId(id)
    }))
  ], [selectedTaskId, setLang, setSearchFilter, setThemeId, setViewMode]);

  useEffect(() => {
    // Reset a legacy persisted List view after it was removed.
    if ((viewMode as string) === 'list') setViewMode('board');
  }, [viewMode, setViewMode]);

  useEffect(() => {
    applyTheme(themeId, glassCustomBg, glassCustomImage);
  }, [themeId, glassCustomBg, glassCustomImage]);

  useEffect(() => {
    purgeExpiredTasks();
    const interval = window.setInterval(purgeExpiredTasks, 60_000);
    return () => window.clearInterval(interval);
  }, [purgeExpiredTasks]);

  useEffect(() => {
    if (!isPomodoroRunning) return;
    const interval = window.setInterval(tickPomodoro, 1000);
    return () => window.clearInterval(interval);
  }, [isPomodoroRunning, tickPomodoro]);

  // Project filtered tasks list for keyboard navigation
  const projectTasks = tasks.filter((t) => t.projectId === activeProjectId);

  // Global Keyboard Shortcuts (j/k, n, g p, g d, ?, Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when typing inside inputs or textareas
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select';

      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
        return;
      }

      if (isInput || isCmdPaletteOpen || isCheatsheetOpen) return;

      // Handle Vim 'g' combinations (g p, g d)
      if (gKeyPressed) {
        setGKeyPressed(false);
        if (e.key === 'p') {
          setViewMode('profile');
          return;
        }
        if (e.key === 'd') {
          setViewMode('board');
          return;
        }
      }

      if (e.key === 'g') {
        setGKeyPressed(true);
        setTimeout(() => setGKeyPressed(false), 1000);
        return;
      }

      if (e.key === ':') {
        e.preventDefault();
        setIsCmdPaletteOpen(true);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsCheatsheetOpen((prev) => !prev);
        return;
      }

      if (e.key === 'n') {
        e.preventDefault();
        setIsCmdPaletteOpen(true);
        return;
      }

      // 'j' move selection down
      if (e.key === 'j') {
        e.preventDefault();
        if (projectTasks.length === 0) return;
        const currentIdx = projectTasks.findIndex((t) => t.id === selectedTaskId);
        const nextIdx = currentIdx < projectTasks.length - 1 ? currentIdx + 1 : 0;
        setSelectedTaskId(projectTasks[nextIdx].id);
        return;
      }

      // 'k' move selection up
      if (e.key === 'k') {
        e.preventDefault();
        if (projectTasks.length === 0) return;
        const currentIdx = projectTasks.findIndex((t) => t.id === selectedTaskId);
        const prevIdx = currentIdx > 0 ? currentIdx - 1 : projectTasks.length - 1;
        setSelectedTaskId(projectTasks[prevIdx].id);
        return;
      }

      // Enter to view selected task detail modal
      if (e.key === 'Enter' && selectedTaskId) {
        // Will trigger modal automatically because selectedTaskId is truthy when clicked/selected
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCmdPaletteOpen,
    isCheatsheetOpen,
    gKeyPressed,
    projectTasks,
    selectedTaskId,
    setSelectedTaskId,
    setViewMode
  ]);

  if (!mounted) return null;
  if (!isAuthenticated) return <LoginGate />;

  return (
    <div className="terminal-app min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col font-mono transition-colors duration-200">
      {/* App Header */}
      <Header
        onOpenCommandPalette={() => setIsCmdPaletteOpen(true)}
        onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
      />
      <DeadlineNotice />

      {/* Search Filter Banner (Active if searchFilter is set) */}
      {searchFilter && (
        <div className="bg-[var(--accent-yellow)]/10 border-b border-[var(--accent-yellow)]/30 px-6 py-2 text-xs flex items-center justify-between">
          <span className="text-[var(--accent-yellow)] font-bold">
            🔍 Filter pencarian aktif: &quot;<code className="underline">{searchFilter}</code>&quot;
          </span>
          <button
            onClick={() => setSearchFilter('')}
            className="text-[var(--text-muted)] hover:text-[var(--text-bright)] underline"
          >
            Clear Filter ✕
          </button>
        </div>
      )}

      {/* Main View Area */}
      <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={viewMode}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -3 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 0.8, 0.24, 1] }}
        className="terminal-main flex-1 w-full max-w-7xl mx-auto p-4 pb-12 sm:p-6 sm:pb-10 space-y-6"
      >
        {viewMode === 'board' && (
          <BoardView
            selectedTaskId={selectedTaskId}
            onSelectTask={(id) => setSelectedTaskId(id)}
          />
        )}

        {viewMode === 'grid' && (
          <GridView
            selectedTaskId={selectedTaskId}
            onSelectTask={(id) => setSelectedTaskId(id)}
          />
        )}

        {viewMode === 'timeline' && (
          <TimelineView
            onSelectTask={(id) => setSelectedTaskId(id)}
          />
        )}

        {viewMode === 'graph' && (
          <GraphView onSelectTask={(id) => setSelectedTaskId(id)} />
        )}
        {viewMode === 'mission' && <MissionControlView onSelectTask={(id) => setSelectedTaskId(id)} />}
        {viewMode === 'analytics' && <AnalyticsView />}
        {viewMode === 'notes' && <NotesDashboard key={newNoteTitle} />}

        {viewMode === 'zen' && <ZenView />}

        {viewMode === 'profile' && <ProfileView />}
        {viewMode === 'inbox' && <InboxView onSelectTask={(id) => setSelectedTaskId(id)} />}

        {/* Git Log Terminal Activity Widget */}
        <TerminalLogView />
      </motion.main>
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-[var(--border-main)]/50 bg-[var(--bg-surface)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] text-center text-xs text-[var(--text-muted)] supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p>© 2026 TermFlow — Terminal-First Task & Project Management</p>
        <p className="mt-1 text-[10px]">
          Press <kbd className="border border-[var(--border-main)] px-1 rounded text-[var(--accent-cyan)]">Ctrl+K</kbd> for command palette | Press <kbd className="border border-[var(--border-main)] px-1 rounded text-[var(--accent-yellow)]">?</kbd> for shortcuts cheatsheet
        </p>
      </footer>
      <div className="h-7 shrink-0 sm:h-7" aria-hidden />
      <GlobalStatusBar />

      {/* Command Palette Modal */}
      <CommandPalette
        commands={commands}
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutCheatsheet
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
      <FocusStatusBar />
      <WeeklyReviewModal isOpen={isWeeklyReviewOpen} onClose={() => setIsWeeklyReviewOpen(false)} />
      <QuickCaptureModal isOpen={isQuickCaptureOpen} onClose={() => setIsQuickCaptureOpen(false)} />
      {reportPeriod && <StandupReportModal period={reportPeriod} onClose={() => setReportPeriod(null)} />}
      <NewProjectModal isOpen={isNewProjectOpen} onClose={() => setIsNewProjectOpen(false)} />
    </div>
  );
}