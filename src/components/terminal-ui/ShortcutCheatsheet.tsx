'use client';

import { getTranslation } from '@/lib/i18n';
import { useTermFlowStore } from '@/lib/store';

interface ShortcutCheatsheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutCheatsheet({ isOpen, onClose }: ShortcutCheatsheetProps) {
  const { lang } = useTermFlowStore();

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl+K / :', descKey: 'cheatsheet.cmdPalette' },
    { key: 'j / k', descKey: 'cheatsheet.navDownUp' },
    { key: 'n', descKey: 'cheatsheet.newTask' },
    { key: 'Enter', descKey: 'cheatsheet.openDetail' },
    { key: 'g p', descKey: 'cheatsheet.gotoProfile' },
    { key: 'g d', descKey: 'cheatsheet.gotoDashboard' },
    { key: '?', descKey: 'cheatsheet.cheatsheetKey' },
  ];

  return (
    <div className="terminal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-mono">
      <div 
        className="w-full max-w-lg bg-[var(--bg-surface)] border-2 border-[var(--border-main)] rounded-lg shadow-2xl overflow-hidden text-[var(--text-main)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--bg-app)] border-b border-[var(--border-main)] px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--accent-yellow)] flex items-center gap-1.5">
            <span>⌨️</span>
            <span>{getTranslation('cheatsheet.title', lang)}</span>
          </span>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-bright)]">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="divide-y divide-[var(--border-main)]/40 text-xs">
            {shortcuts.map((sc, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between">
                <span className="text-[var(--text-main)]">{getTranslation(sc.descKey, lang)}</span>
                <kbd className="bg-[var(--bg-muted)] border border-[var(--border-main)] px-2 py-1 rounded text-[var(--accent-cyan)] font-bold text-xs shadow-xs">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-app)] border-t border-[var(--border-main)] p-3 text-center text-xs text-[var(--text-muted)]">
          Press <kbd className="border border-[var(--border-main)] px-1.5 py-0.5 rounded text-[var(--text-main)]">ESC</kbd> or <kbd className="border border-[var(--border-main)] px-1.5 py-0.5 rounded text-[var(--text-main)]">?</kbd> to close.
        </div>
      </div>
    </div>
  );
}
