'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder, ariaLabel, className, triggerClassName }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className || ''}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`terminal-input flex w-full items-center justify-between gap-2 py-2 text-left text-xs sm:text-sm ${triggerClassName || ''} ${open ? 'border-[var(--accent-cyan)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent-cyan)_15%,transparent)]' : ''}`}
      >
        <span className={`truncate ${selected ? 'text-[var(--text-bright)] font-semibold' : 'text-[var(--text-muted)]'}`}>
          {selected ? selected.label : placeholder || 'Pilih...'}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden
          className={`shrink-0 text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-56 overflow-auto rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] p-1 shadow-2xl"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`flex min-h-[40px] w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition sm:text-sm ${active ? 'bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] font-bold' : 'text-[var(--text-main)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)]'}`}
              >
                <span className="truncate">{opt.label}</span>
                {active && <Check size={13} strokeWidth={2} className="shrink-0" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
