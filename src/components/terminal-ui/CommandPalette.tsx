'use client';

import { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  const filteredCommands = commands.filter((command) => {
    const query = searchQuery.toLowerCase();
    return command.label.toLowerCase().includes(query) ||
      command.description.toLowerCase().includes(query);
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      filteredCommands[selectedIndex]?.execute();
      onClose();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(0, index - 1));
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((index) => Math.min(filteredCommands.length - 1, index + 1));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-lg border-2 border-[var(--border-main)] bg-[var(--bg-surface)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari perintah..."
          className="w-full border-b border-[var(--border-main)] bg-[var(--bg-app)] p-3 text-[var(--text-main)] focus:outline-none"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />

        {filteredCommands.length > 0 ? (
          <ul className="max-h-[60vh] overflow-y-auto p-2">
            {filteredCommands.map((command, index) => (
              <li
                key={command.id}
                className={`cursor-pointer rounded px-3 py-2 ${
                  index === selectedIndex
                    ? 'border-l-4 border-[var(--accent-cyan)] bg-[var(--bg-muted)]'
                    : 'hover:bg-[var(--bg-muted)]/60'
                }`}
                onClick={() => {
                  command.execute();
                  onClose();
                }}
              >
                <div className="flex justify-between">
                  <span className="font-medium text-[var(--text-bright)]">{command.label}</span>
                  <span className="text-[10px] text-[var(--accent-yellow)]">{command.shortcut || ''}</span>
                </div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">{command.description}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-sm text-[var(--text-muted)]">Perintah tidak ditemukan.</p>
        )}

        <div className="border-t border-[var(--border-main)] p-2 text-[10px] text-[var(--text-muted)]">
          ↑↓ pilih · Enter jalankan · Esc tutup
        </div>
      </div>
    </div>
  );
}
