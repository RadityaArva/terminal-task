'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
    viewMode,
    setViewMode,
    themeId,
    setThemeId,
    lang,
    setLang,
    tasks
  } = useTermFlowStore();
  const inboxCount = tasks.filter((task) => task.projectId === 'inbox').length;

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const headerRef = useRef<HTMLElement>(null);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profile = useTermFlowStore((state) => state.profile);
  const logout = useTermFlowStore((state) => state.logout);

  // auto-close dropdowns when clicking outside navbar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setShowMoreMenu(false);
        setShowSettingsMenu(false);
        setShowProfileMenu(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setShowMoreMenu(false);
        setShowSettingsMenu(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // close any open menu immediately when navigating to another view
  useEffect(() => {
    setIsMenuOpen(false);
    setShowMoreMenu(false);
    setShowSettingsMenu(false);
    setShowProfileMenu(false);
  }, [viewMode]);

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date()));
    };
    updateClock();
    const interval = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const NavIcon = ({ id, active }: { id: ViewMode; active?: boolean }) => {
    const cls = active ? 'text-[var(--accent-main)]' : 'text-current';
    const common = `h-4 w-4 shrink-0 ${cls}`;
    switch (id) {
      case 'board': return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/></svg>;
      case 'grid': return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 8h18M8 4v16M14 4v16"/></svg>;
      case 'timeline': return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/><path d="M3 12h2M19 12h2M12 3v2M12 19v2"/></svg>;
      case 'graph': return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="12" cy="17" r="3"/><path d="M9.5 9l2.5 4M14.5 9l-2.5 4"/></svg>;
      case 'zen': return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8"/><path d="M12 12a4 4 0 0 0 4-4"/><path d="M8 12a4 4 0 0 1 4 4"/></svg>;
      case 'profile': return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M5 19a7 7 0 0 1 14 0"/></svg>;
      case 'inbox': return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 7l9 7 9-7"/></svg>;
      case 'mission': return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l7 4v6l-7 4-7-4V7l7-4z"/><circle cx="12" cy="12" r="2.5"/></svg>;
      case 'analytics': return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-8"/><path d="M2 19h20"/></svg>;
      case 'notes': return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v5h5"/><path d="M9 13h8M9 17h6"/></svg>;
      default: return null;
    }
  };
  const views: { id: ViewMode; labelKey: string }[] = [
    { id: 'board', labelKey: 'nav.board' },
    { id: 'grid', labelKey: 'nav.grid' },
    { id: 'timeline', labelKey: 'nav.timeline' },
    { id: 'graph', labelKey: 'nav.graph' },
    { id: 'zen', labelKey: 'nav.zen' },
    { id: 'profile', labelKey: 'nav.profile' },
    { id: 'inbox', labelKey: 'nav.inbox' },
    { id: 'mission', labelKey: 'nav.mission' },
    { id: 'analytics', labelKey: 'nav.analytics' },
    { id: 'notes', labelKey: 'nav.notes' },
  ];
  const primaryViews = views.slice(0, 4);
  const secondaryViews = views.slice(4);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-[var(--border-main)]/60 bg-[var(--bg-surface)]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--bg-surface)]/80">
      {/* top bar */}
      <div className="flex h-[3.25rem] items-center gap-2 px-3 sm:h-14 sm:gap-3 sm:px-4 lg:px-5">
        {/* left: brand + workspace */}
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setViewMode('board')}
            className="group flex items-center gap-2 rounded-md px-1 py-1 -ml-1 transition hover:bg-[var(--bg-muted)]"
            title="Open dashboard"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--accent-main)]/30 bg-[var(--accent-main)]/10 text-[var(--accent-main)] text-sm font-bold leading-none">›_</span>
            <span className="hidden text-sm font-bold tracking-tight text-[var(--text-bright)] sm:inline sm:text-[15px]">TermFlow</span>
            <span className="hidden h-3 w-px bg-[var(--border-main)]/60 sm:block" />
          </button>

          {/* workspace chip — hidden on very small, compact on mobile */}
          <div className="hidden min-w-0 items-center gap-1.5 rounded-full border border-[var(--border-main)]/50 bg-[var(--bg-app)] px-2.5 py-1 sm:flex">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-main)] shadow-[0_0_6px_var(--accent-main)]" />
            <span className="max-w-[9rem] truncate text-xs font-semibold tracking-wide text-[var(--text-muted)] lg:max-w-[11rem]">{activeProject.name}</span>
          </div>

          {/* primary nav — desktop only */}
          <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
            {primaryViews.map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${viewMode === v.id ? 'bg-[var(--bg-app)] text-[var(--accent-main)] ring-1 ring-[var(--accent-main)]/20' : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-main)]'}`}
                title={getTranslation(v.labelKey, lang)}
                aria-current={viewMode === v.id ? 'page' : undefined}
              >
                <NavIcon id={v.id} active={viewMode === v.id} />
                <span className="hidden 2xl:inline">{getTranslation(v.labelKey, lang).replace(' (Kanban)', '').replace(' Table', '')}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* center: command palette */}
        <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-3">
          <button
            onClick={onOpenCommandPalette}
            className="group flex w-full max-w-[22rem] items-center gap-2 rounded-lg border border-[var(--border-main)]/70 bg-[var(--bg-app)] px-2.5 py-2 text-left transition hover:border-[var(--accent-cyan)]/60 hover:bg-[var(--bg-app)] sm:max-w-md sm:px-3 sm:py-2"
            aria-label="Open command palette"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-xs font-bold">⌘</span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium tracking-wide text-[var(--text-muted)] group-hover:text-[var(--text-main)] sm:text-[13px]">
              <span className="hidden sm:inline">{getTranslation('command.title', lang)}</span>
              <span className="sm:hidden">Command</span>
            </span>
            <kbd className="hidden shrink-0 rounded border border-[var(--border-main)] bg-[var(--bg-muted)] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-[var(--text-muted)] sm:inline-flex">Ctrl K</kbd>
            <span className="shrink-0 text-[10px] text-[var(--text-muted)] sm:hidden">›</span>
          </button>
        </div>

        {/* right: actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <time className="hidden min-w-[4.5rem] text-right font-mono text-[11px] tabular-nums tracking-wide text-[var(--text-muted)] xl:block">{currentTime || '--:--:--'}</time>

          <button
            onClick={() => setViewMode('inbox')}
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border-main)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-main)] sm:h-9 sm:w-9"
            title={`Inbox: ${inboxCount} task`}
            aria-label="Inbox"
          >
            <span className="text-sm leading-none">✉</span>
            {inboxCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-red)] px-1 text-[10px] font-bold leading-none text-white">{inboxCount > 9 ? '9+' : inboxCount}</span>}
          </button>

          <span className="hidden h-5 w-px bg-[var(--border-main)]/50 sm:block" />

          {/* more */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowMoreMenu((v) => !v)}
              aria-expanded={showMoreMenu}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition sm:h-9 sm:w-9 ${showMoreMenu ? 'border-[var(--accent-cyan)]/40 bg-[var(--bg-muted)] text-[var(--text-bright)]' : 'border-transparent text-[var(--text-muted)] hover:border-[var(--border-main)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-main)]'}`}
              title="More"
            >⋯</button>
            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: [0.22, 0.8, 0.24, 1] }}
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-1.5 shadow-2xl"
                >
                  <div className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Quick actions</div>
                  <button onClick={() => { setShowNotes(true); setShowMoreMenu(false); }} className="menu-item flex items-center gap-2"><span className="text-[var(--accent-cyan)]">✎</span> Notes</button>
                  <div className="relative">
                    <button onClick={() => setShowExportMenu((v) => !v)} className="menu-item flex w-full items-center justify-between"> <span className="flex items-center gap-2"><span>⤓</span> Export</span><span className="text-[10px] text-[var(--text-muted)]">{showExportMenu ? '−' : '+'}</span></button>
                    <AnimatePresence>
                      {showExportMenu && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="ml-2 mt-1 space-y-0.5 border-l border-[var(--border-main)]/50 pl-2">
                            <button onClick={() => exportTasksToJSON(tasks)} className="menu-item text-xs">JSON</button>
                            <button onClick={() => exportTasksToMarkdown(tasks, activeProject.name)} className="menu-item text-xs">Markdown</button>
                            <button onClick={() => exportTasksToCSV(tasks)} className="menu-item text-xs">CSV</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button onClick={() => { onOpenCheatsheet(); setShowMoreMenu(false); }} className="menu-item flex items-center gap-2"><span>⌨</span> Shortcuts</button>
                  <div className="my-1.5 border-t border-[var(--border-main)]/60" />
                  <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Views</div>
                  {secondaryViews.map((v) => (
                    <button key={v.id} onClick={() => setViewMode(v.id)} className={`menu-item flex items-center gap-2 ${viewMode === v.id ? 'bg-[var(--bg-muted)] text-[var(--accent-main)]' : ''}`}>
                      <NavIcon id={v.id} active={viewMode === v.id} /> {getTranslation(v.labelKey, lang)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* settings */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowSettingsMenu((v) => !v)}
              aria-expanded={showSettingsMenu}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition sm:h-9 sm:w-9 ${showSettingsMenu ? 'border-[var(--accent-cyan)]/40 bg-[var(--bg-muted)] text-[var(--text-bright)]' : 'border-transparent text-[var(--text-muted)] hover:border-[var(--border-main)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-main)]'}`}
              title="Settings"
            >⚙</button>
            <AnimatePresence>
              {showSettingsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-3 shadow-2xl"
                >
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Theme</label>
                  <select value={themeId} onChange={(e) => setThemeId(e.target.value as ThemeId)} className="terminal-input py-2 text-xs font-medium">
                    {Object.values(THEMES).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className="menu-item mt-2 flex items-center gap-2"><span>◐</span> Language: <span className="font-bold text-[var(--accent-cyan)]">{lang.toUpperCase()}</span></button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu((v) => !v)}
              aria-expanded={showProfileMenu}
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--bg-muted)] bg-[var(--bg-muted)] text-xs font-bold text-[var(--accent-cyan)] ring-1 ring-[var(--border-main)]/50 transition hover:border-[var(--accent-cyan)]/40 hover:ring-[var(--accent-cyan)]/20 sm:h-9 sm:w-9"
              title="Profile"
            >
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt={profile.username || 'Avatar'} width={36} height={36} className="h-full w-full object-cover" unoptimized />
              ) : (
                profile.username.slice(0, 2).toUpperCase()
              )}
            </button>
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-[calc(100%+10px)] z-50 w-48 overflow-hidden rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-1.5 shadow-2xl"
                >
                  <div className="px-3 py-2">
                    <div className="truncate text-xs font-bold text-[var(--text-bright)]">{profile.username}</div>
                    <div className="truncate text-[11px] text-[var(--text-muted)]">{profile.role || 'Member'}</div>
                  </div>
                  <div className="my-1 border-t border-[var(--border-main)]/60" />
                  <button onClick={() => setViewMode('profile')} className="menu-item">◐ Profile</button>
                  <button onClick={logout} className="menu-item text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10">↪ Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((o) => !o)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm leading-none transition sm:h-9 sm:w-9 lg:hidden ${isMenuOpen ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)] text-[var(--bg-app)]' : 'border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-muted)] hover:border-[var(--accent-cyan)]/40 hover:text-[var(--text-main)]'}`}
          >
            <span className="relative block h-3.5 w-3.5">
              <span className={`absolute left-0 top-0 h-0.5 w-full rounded bg-current transition ${isMenuOpen ? 'translate-y-[5px] rotate-45' : ''}`} />
              <span className={`absolute left-0 top-[5px] h-0.5 w-full rounded bg-current transition ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 top-[10px] h-0.5 w-full rounded bg-current transition ${isMenuOpen ? '-translate-y-[5px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </div>

      {/* mobile/workspace sub-bar — visible only on small */}
      <div className="flex items-center gap-2 border-t border-[var(--border-main)]/40 bg-[var(--bg-app)]/60 px-3 py-2 sm:hidden">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-main)]" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--text-muted)]">{activeProject.name}</span>
        <span className="shrink-0 rounded-full border border-[var(--border-main)]/60 bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-[var(--accent-cyan)]">{viewMode}</span>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 0.8, 0.24, 1] }}
            className="overflow-hidden border-t border-[var(--border-main)] bg-[var(--bg-app)] lg:hidden"
          >
            <div className="space-y-3 p-3">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {views.map((v) => {
                  const active = viewMode === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setViewMode(v.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition ${active ? 'border-[var(--accent-main)]/40 bg-[var(--accent-main)]/10 text-[var(--accent-main)]' : 'border-[var(--border-main)]/40 bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--accent-cyan)]/30 hover:text-[var(--text-main)]'}`}
                    >
                      <NavIcon id={v.id} active={viewMode === v.id} />
                      <span className="line-clamp-1 text-[10px] font-semibold leading-tight tracking-wide">{getTranslation(v.labelKey, lang).split(' ')[0]}</span>
                      {v.id === 'inbox' && inboxCount > 0 && <span className="rounded-full bg-[var(--accent-red)] px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">{inboxCount}</span>}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setShowNotes(true); setIsMenuOpen(false); }} className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] px-3 py-2.5 text-left text-xs font-medium text-[var(--text-main)] hover:border-[var(--accent-cyan)]/40">
                  <span className="block text-[11px] font-bold tracking-wide text-[var(--accent-cyan)]">✎ Notes</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Quick capture</span>
                </button>
                <button onClick={() => { onOpenCheatsheet(); setIsMenuOpen(false); }} className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] px-3 py-2.5 text-left text-xs font-medium text-[var(--text-main)] hover:border-[var(--accent-cyan)]/40">
                  <span className="block text-[11px] font-bold tracking-wide text-[var(--accent-yellow)]">⌨ Shortcuts</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Cheatsheet</span>
                </button>
              </div>

              <div className="rounded-xl border border-[var(--border-main)]/50 bg-[var(--bg-surface)] p-3">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Theme & Language</label>
                <div className="grid grid-cols-2 gap-2">
                  <select value={themeId} onChange={(e) => setThemeId(e.target.value as ThemeId)} className="terminal-input py-2 text-xs">
                    {Object.values(THEMES).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-app)] px-3 py-2 text-xs font-bold text-[var(--text-main)] hover:border-[var(--accent-cyan)]/40">
                    ◐ {lang.toUpperCase()}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotesPanel isOpen={showNotes} onClose={() => setShowNotes(false)} />
    </header>
  );
}
