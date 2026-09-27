'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  placeholder?: string;
}

function toKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
function fromKey(s: string): Date | null {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}
function displayValue(value: string) {
  if (!value) return '';
  const d = fromKey(value);
  if (!d) return value;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CustomDatePicker({ value, onChange, ariaLabel, className, placeholder }: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => fromKey(value) || new Date());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 300 });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (value) {
      const d = fromKey(value);
      if (d) setViewMonth(new Date(d));
    }
  }, [value, open]);

  const updatePos = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const panelW = 300;
    const panelH = 360;
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const flipUp = spaceBelow < panelH + 12 && spaceAbove > spaceBelow;
    const top = flipUp ? r.top + window.scrollY - panelH - 6 : r.bottom + window.scrollY + 6;
    // keep inside viewport horizontally
    let left = r.left + window.scrollX;
    if (left + panelW > window.innerWidth - 8) left = window.innerWidth - panelW - 8;
    if (left < 8) left = 8;
    setPos({ top, left, width: panelW });
  };

  useEffect(() => {
    if (!open) return;
    updatePos();
    const onDown = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScroll = () => updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', onScroll, true);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(1 - firstDay.getDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const todayKey = toKey(new Date());

  return (
    <div className={`relative ${className || ''}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open) updatePos();
          setOpen((v) => !v);
        }}
        className={`terminal-input flex w-full items-center justify-between gap-2 py-2 text-left text-xs sm:text-sm ${open ? 'border-[var(--accent-cyan)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent-cyan)_15%,transparent)]' : ''} ${value ? 'text-[var(--text-bright)]' : 'text-[var(--text-muted)]'}`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
          <Calendar size={14} strokeWidth={1.75} className="shrink-0 text-[var(--accent-cyan)]" aria-hidden />
          <span className="truncate">{value ? displayValue(value) : placeholder || 'Pilih tanggal'}</span>
        </span>
      </button>

      {mounted && open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={ariaLabel || 'Pilih tanggal'}
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 9999,
            }}
            className="overflow-hidden rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-3 shadow-2xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)]"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
              </button>
              <span className="text-xs font-bold capitalize text-[var(--text-bright)]">
                {viewMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
              <button
                type="button"
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)]"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight size={16} strokeWidth={1.75} aria-hidden />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((n) => (
                <span key={n} className="py-1">
                  {n}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 pt-1">
              {days.map((d) => {
                const key = toKey(d);
                const isCurrentMonth = d.getMonth() === viewMonth.getMonth();
                const isToday = key === todayKey;
                const isSelected = key === value;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                    className={`inline-flex h-8 w-full items-center justify-center rounded-md text-xs font-medium transition ${isSelected ? 'bg-[var(--accent-cyan)] font-bold text-[var(--bg-app)] shadow-sm' : isToday ? 'bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] ring-1 ring-[var(--accent-cyan)]/30' : isCurrentMonth ? 'bg-[var(--bg-app)] text-[var(--text-main)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)]' : 'bg-transparent text-[var(--text-muted)] opacity-40 hover:opacity-100'}`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-[var(--border-main)]/50 pt-2">
              <button type="button" onClick={() => { onChange(toKey(new Date())); setOpen(false); }} className="text-[11px] font-bold text-[var(--accent-cyan)] hover:underline">
                Hari ini
              </button>
              <button type="button" onClick={() => setOpen(false)} className="terminal-button py-1 text-[11px]">
                Tutup
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
