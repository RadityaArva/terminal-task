'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type Command = {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  execute: () => void;
};

type CommandPaletteProps = {
  commands: Command[];
  isOpen: boolean;
  onClose: () => void;
};

export default function CommandPalette({ commands, isOpen, onClose }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => {
      setSearchQuery('');
      setSelectedIndex(0);
    });
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [isOpen]);

  const filteredCommands = commands.filter((command) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      command.label.toLowerCase().includes(query) ||
      command.description.toLowerCase().includes(query) ||
      (command.shortcut && command.shortcut.toLowerCase().includes(query))
    );
  });

  // reset selection when query changes — keep in sync without extra effect firing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedIndex(0);
  };

  // keep selected item in view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const cmd = filteredCommands[selectedIndex];
      if (cmd) {
        cmd.execute();
        onClose();
      }
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((i) => Math.max(0, i - 1));
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((i) => Math.min(filteredCommands.length - 1, i + 1));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-[#0a0e14]/70 p-2 backdrop-blur-[2px] sm:p-4 sm:pt-[12vh]"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: 0.22, ease: [0.22, 0.8, 0.24, 1] }}
            className="flex max-h-[min(78vh,640px)] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[var(--bg-surface)] shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* input row */}
            <div className="flex items-center gap-3 border-b border-[var(--border-main)]/70 bg-[var(--bg-app)] px-3 py-3 sm:px-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan)]/10 font-mono text-xs font-bold text-[var(--accent-cyan)]">›_</span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Cari perintah, view, atau theme…  (mis. board, dracula, high)"
                className="min-w-0 flex-1 bg-transparent font-mono text-sm font-medium text-[var(--text-bright)] placeholder:text-[var(--text-muted)] focus:outline-none"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Search commands"
              />
              <kbd className="hidden shrink-0 rounded-md border border-[var(--border-main)] bg-[var(--bg-muted)] px-1.5 py-1 font-mono text-[10px] font-bold tracking-wide text-[var(--text-muted)] sm:inline-flex">ESC</kbd>
              <button
                onClick={onClose}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition hover:border-[var(--accent-red)]/40 hover:text-[var(--accent-red)] sm:hidden"
                aria-label="Close"
              >✕</button>
            </div>

            {/* meta row */}
            <div className="flex items-center justify-between border-b border-[var(--border-main)]/40 bg-[var(--bg-surface)] px-3 py-2 sm:px-4">
              <span className="font-mono text-[11px] tracking-wide text-[var(--text-muted)]">
                {filteredCommands.length} perintah · <span className="text-[var(--text-main)]">{searchQuery ? `hasil untuk "${searchQuery}"` : 'ketik untuk filter'}</span>
              </span>
              <span className="hidden font-mono text-[11px] text-[var(--text-muted)] sm:inline">↵ jalankan · ↑↓ pilih</span>
            </div>

            {filteredCommands.length > 0 ? (
              <ul ref={listRef} className="flex-1 overflow-y-auto p-2 sm:p-2.5">
                {filteredCommands.map((command, index) => {
                  const active = index === selectedIndex;
                  return (
                    <li key={command.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => {
                          command.execute();
                          onClose();
                        }}
                        className={`group flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition sm:px-3.5 sm:py-2.5 ${active ? 'border-[var(--accent-cyan)]/30 bg-[var(--bg-app)] shadow-sm' : 'border-transparent hover:border-[var(--border-main)]/50 hover:bg-[var(--bg-app)]/60'}`}
                      >
                        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold leading-none transition ${active ? 'border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)]' : 'border-[var(--border-main)]/50 bg-[var(--bg-muted)] text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}>
                          {command.label.trim().charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-sm font-semibold leading-tight ${active ? 'text-[var(--text-bright)]' : 'text-[var(--text-main)]'}`}>{command.label}</span>
                          <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-[var(--text-muted)]">{command.description}</span>
                        </span>
                        {command.shortcut && (
                          <span className={`hidden shrink-0 rounded-full border px-2 py-1 font-mono text-[10px] font-bold tracking-wide sm:inline-flex ${active ? 'border-[var(--accent-yellow)]/30 bg-[var(--accent-yellow)]/10 text-[var(--accent-yellow)]' : 'border-[var(--border-main)]/60 bg-[var(--bg-muted)] text-[var(--text-muted)]'}`}>
                            {command.shortcut}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-muted)]">∅</span>
                <p className="text-sm font-semibold text-[var(--text-main)]">Perintah tidak ditemukan</p>
                <p className="max-w-[28ch] text-xs leading-relaxed text-[var(--text-muted)]">Coba kata kunci lain — mis. “board”, “inbox”, “dracula”, atau “review week”.</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-[var(--border-main)]/60 bg-[var(--bg-app)]/70 px-3 py-2.5 text-[11px] sm:px-4">
              <span className="inline-flex items-center gap-1.5 font-mono text-[var(--text-muted)]">
                <span className="hidden h-1.5 w-1.5 rounded-full bg-[var(--accent-main)] sm:inline-block" />
                TermFlow palette
              </span>
              <span className="font-mono text-[var(--text-muted)]">
                <span className="hidden sm:inline">Tekan </span><kbd className="rounded border border-[var(--border-main)] bg-[var(--bg-muted)] px-1 py-0.5 font-mono text-[10px]">Ctrl K</kbd> lagi untuk toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
