'use client';

import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useTermFlowStore } from '@/lib/store';
import { applyTheme } from '@/lib/themes';
import Header from '@/components/terminal-ui/Header';
import CommandPalette from '@/components/terminal-ui/CommandPalette';
import ShortcutCheatsheet from '@/components/terminal-ui/ShortcutCheatsheet';
import TerminalLogView from '@/components/terminal-ui/TerminalLogView';

import BoardView from '@/components/views/BoardView';
import ListView from '@/components/views/ListView';
import GridView from '@/components/views/GridView';
import TimelineView from '@/components/views/TimelineView';
import ZenView from '@/components/views/ZenView';
import ProfileView from '@/components/views/ProfileView';

import TaskDetailModal from '@/components/task/TaskDetailModal';
import LoginGate from '@/components/auth/LoginGate';
import DeadlineNotice from '@/components/terminal-ui/DeadlineNotice';

export default function Home() {
  const {
    viewMode,
    setViewMode,
    themeId,
    tasks,
    activeProjectId,
    selectedTaskId,
    setSelectedTaskId,
    searchFilter,
    setSearchFilter,
    setThemeId,
    setLang,
    purgeExpiredTasks
  } = useTermFlowStore();
  const isAuthenticated = useTermFlowStore((state) => state.isAuthenticated);

  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [gKeyPressed, setGKeyPressed] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  const commands = useMemo(() => [
    {
      id: 'view-board',
      label: 'Open board view',
      description: 'Switch to the kanban board',
      shortcut: 'g d',
      execute: () => setViewMode('board')
    },
    {
      id: 'view-list',
      label: 'Open list view',
      description: 'Switch to the task list',
      execute: () => setViewMode('list')
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
  ], [setLang, setSearchFilter, setThemeId, setViewMode]);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  useEffect(() => {
    purgeExpiredTasks();
    const interval = window.setInterval(purgeExpiredTasks, 60_000);
    return () => window.clearInterval(interval);
  }, [purgeExpiredTasks]);

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
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col font-mono transition-colors duration-200">
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
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {viewMode === 'board' && (
          <BoardView
            selectedTaskId={selectedTaskId}
            onSelectTask={(id) => setSelectedTaskId(id)}
          />
        )}

        {viewMode === 'list' && (
          <ListView
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

        {viewMode === 'zen' && <ZenView />}

        {viewMode === 'profile' && <ProfileView />}

        {/* Git Log Terminal Activity Widget */}
        <TerminalLogView />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-main)]/50 bg-[var(--bg-surface)] p-4 text-center text-xs text-[var(--text-muted)]">
        <p>© 2026 TermFlow — Terminal-First Task & Project Management</p>
        <p className="mt-1 text-[10px]">
          Press <kbd className="border border-[var(--border-main)] px-1 rounded text-[var(--accent-cyan)]">Ctrl+K</kbd> for command palette | Press <kbd className="border border-[var(--border-main)] px-1 rounded text-[var(--accent-yellow)]">?</kbd> for shortcuts cheatsheet
        </p>
      </footer>

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
    </div>
  );
}