'use client';

import { useState } from 'react';
import { useTermFlowStore, ViewMode } from '@/lib/store';
import { THEMES, ThemeId } from '@/lib/themes';
import { getTranslation } from '@/lib/i18n';
import { exportTasksToJSON, exportTasksToMarkdown, exportTasksToCSV } from '@/lib/exportUtils';
import NotesPanel from './NotesPanel';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenCheatsheet: () => void;
}

export default function Header({ onOpenCommandPalette, onOpenCheatsheet }: HeaderProps) {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    viewMode,
    setViewMode,
    themeId,
    setThemeId,
    lang,
    setLang,
    tasks
  } = useTermFlowStore();

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const views: { id: ViewMode; labelKey: string; icon: string }[] = [
    { id: 'board', labelKey: 'nav.board', icon: '📋' },
    { id: 'list', labelKey: 'nav.list', icon: '📄' },
    { id: 'grid', labelKey: 'nav.grid', icon: '📊' },
    { id: 'timeline', labelKey: 'nav.timeline', icon: '⏳' },
    { id: 'zen', labelKey: 'nav.zen', icon: '🧘' },
    { id: 'profile', labelKey: 'nav.profile', icon: '👤' },
  ];

  return (
    <header className="border-b border-[var(--border-main)] bg-[var(--bg-surface)] text-[var(--text-main)] transition-colors duration-200">
      {/* Top Window Bar */}
      <div className="flex items-center justify-between px-4 py-2 text-xs border-b border-[var(--border-main)]/50 font-mono">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
          </div>
          <span className="font-bold text-[var(--accent-cyan)] flex items-center gap-1">
            <span>&gt;_ Command Palette Terminal</span>
            <span className="animate-pulse bg-[var(--accent-cyan)] text-[var(--bg-app)] px-1 rounded-xs font-bold">$</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => setShowNotes(true)} className="px-2 py-1 rounded bg-[var(--bg-muted)] hover:bg-[var(--border-main)] text-[var(--accent-yellow)] transition-colors" title="Open saved project notes">📝 Notes</button>
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-2 py-1 rounded bg-[var(--bg-muted)] hover:bg-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1"
              title="Export tasks data"
            >
              <span>💾</span>
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded shadow-lg z-50 py-1 font-mono text-xs">
                <button
                  onClick={() => { exportTasksToJSON(tasks); setShowExportMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-muted)] text-[var(--text-main)]"
                >
                  📄 JSON Format
                </button>
                <button
                  onClick={() => { exportTasksToMarkdown(tasks, activeProject.name); setShowExportMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-muted)] text-[var(--text-main)]"
                >
                  📝 Markdown (.md)
                </button>
                <button
                  onClick={() => { exportTasksToCSV(tasks); setShowExportMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-muted)] text-[var(--text-main)]"
                >
                  📊 Spreadsheet (.csv)
                </button>
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value as ThemeId)}
            className="bg-[var(--bg-muted)] text-[var(--text-main)] border border-[var(--border-main)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]"
          >
            {Object.values(THEMES).map((t) => (
              <option key={t.id} value={t.id}>
                🎨 {t.name}
              </option>
            ))}
          </select>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            className="px-2 py-1 rounded bg-[var(--bg-muted)] hover:bg-[var(--border-main)] text-[var(--text-main)] font-semibold transition-colors"
          >
            🌐 {lang.toUpperCase()}
          </button>

          {/* Keyboard Cheatsheet Button */}
          <button
            onClick={onOpenCheatsheet}
            className="px-2 py-1 rounded bg-[var(--bg-muted)] hover:bg-[var(--border-main)] text-[var(--accent-yellow)] font-bold transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            ?
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-wider text-[var(--accent-main)]">
              TermFlow
            </span>
            <span className="text-xs bg-[var(--bg-muted)] border border-[var(--border-main)] px-2 py-0.5 rounded text-[var(--text-muted)]">
              v0.4.0-cli
            </span>
          </div>

          {/* Project Switcher */}
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="bg-[var(--bg-app)] text-[var(--accent-cyan)] font-bold border border-[var(--border-main)] rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                📁 [{p.key}] {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 bg-[var(--bg-app)] p-1 rounded-md border border-[var(--border-main)] text-xs">
          {views.map((v) => {
            const isActive = viewMode === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all ${
                  isActive
                    ? 'bg-[var(--bg-muted)] text-[var(--accent-main)] font-bold border border-[var(--border-main)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <span>{v.icon}</span>
                <span>{getTranslation(v.labelKey, lang)}</span>
              </button>
            );
          })}
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-2 bg-[var(--bg-app)] border border-[var(--border-main)] hover:border-[var(--accent-cyan)] text-[var(--text-muted)] hover:text-[var(--text-main)] px-3 py-1.5 rounded text-xs transition-colors"
        >
          <span className="text-[var(--accent-cyan)] font-bold">&gt;_</span>
          <span>{getTranslation('command.title', lang)}</span>
          <kbd className="bg-[var(--bg-muted)] border border-[var(--border-main)] px-1.5 py-0.5 rounded text-[10px] text-[var(--accent-yellow)]">
            Ctrl+K
          </kbd>
        </button>
      </div>
      <NotesPanel isOpen={showNotes} onClose={() => setShowNotes(false)} />
    </header>
  );
}
