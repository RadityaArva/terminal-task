'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface CustomTimePickerProps {
  value: string; // HH:mm
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
}

function parseTime(v: string): { h: number; m: number } {
  if (!v || !/^\d{1,2}:\d{2}$/.test(v)) return { h: 9, m: 0 };
  const [hs, ms] = v.split(':');
  const h = Math.min(23, Math.max(0, parseInt(hs, 10) || 0));
  const m = Math.min(59, Math.max(0, parseInt(ms, 10) || 0));
  return { h, m };
}

function fmt(h: number, m: number) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function CustomTimePicker({ value, onChange, ariaLabel, placeholder }: CustomTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, flipUp: false });
  const [draftH, setDraftH] = useState<number>(parseTime(value).h);
  const [draftM, setDraftM] = useState<number>(parseTime(value).m);
  const [hInput, setHInput] = useState(String(parseTime(value).h).padStart(2, '0'));
  const [mInput, setMInput] = useState(String(parseTime(value).m).padStart(2, '0'));

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const p = parseTime(value);
    setDraftH(p.h);
    setDraftM(p.m);
    setHInput(String(p.h).padStart(2, '0'));
    setMInput(String(p.m).padStart(2, '0'));
  }, [value]);

  const updatePos = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const panelH = 280;
    const spaceBelow = window.innerHeight - r.bottom;
    const flipUp = spaceBelow < panelH + 12 && r.top > spaceBelow;
    setPos({
      top: flipUp ? r.top + window.scrollY - panelH - 6 : r.bottom + window.scrollY + 6,
      left: Math.min(r.left + window.scrollX, window.innerWidth - 220 - 8),
      width: r.width,
      flipUp,
    });
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

  const commit = (h: number, m: number) => {
    const v = fmt(h, m);
    onChange(v);
  };

  const stepH = (d: number) => {
    const nh = (draftH + d + 24) % 24;
    setDraftH(nh);
    setHInput(String(nh).padStart(2, '0'));
    commit(nh, draftM);
  };
  const stepM = (d: number) => {
    let nm = draftM + d;
    let nh = draftH;
    if (nm >= 60) {
      nm -= 60;
      nh = (nh + 1) % 24;
    } else if (nm < 0) {
      nm += 60;
      nh = (nh - 1 + 24) % 24;
    }
    setDraftM(nm);
    setDraftH(nh);
    setHInput(String(nh).padStart(2, '0'));
    setMInput(String(nm).padStart(2, '0'));
    commit(nh, nm);
  };

  const display = value ? value : placeholder || 'Pilih jam';

  return (
    <>
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
          <Clock size={14} strokeWidth={1.75} className="shrink-0 text-[var(--accent-cyan)]" aria-hidden />
          <span className="truncate font-bold">{display}</span>
        </span>
      </button>

      {mounted && open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={ariaLabel || 'Pilih jam'}
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              width: 220,
              zIndex: 9999,
            }}
            className="overflow-hidden rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-3 shadow-2xl"
          >
            <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Pilih jam & menit</div>
            <div className="flex items-center justify-center gap-3">
              {/* Hour */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[var(--text-muted)]">Jam</span>
                <button type="button" onClick={() => stepH(1)} className="inline-flex h-7 w-12 items-center justify-center rounded bg-[var(--bg-app)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)]" aria-label="Tambah jam">
                  <ChevronUp size={14} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={hInput}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                    setHInput(v);
                    if (v !== '' ) {
                      const n = Math.min(23, Math.max(0, parseInt(v, 10) || 0));
                      if (v.length === 2 || n > 2) {
                        setDraftH(n);
                        commit(n, draftM);
                      }
                    }
                  }}
                  onBlur={() => {
                    const n = Math.min(23, Math.max(0, parseInt(hInput, 10) || 0));
                    setDraftH(n);
                    setHInput(String(n).padStart(2, '0'));
                    commit(n, draftM);
                  }}
                  className="h-10 w-12 rounded border border-[var(--border-main)] bg-[var(--bg-app)] text-center text-lg font-bold text-[var(--text-bright)] outline-none focus:border-[var(--accent-cyan)]"
                />
                <button type="button" onClick={() => stepH(-1)} className="inline-flex h-7 w-12 items-center justify-center rounded bg-[var(--bg-app)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)]" aria-label="Kurangi jam">
                  <ChevronDown size={14} />
                </button>
              </div>

              <span className="pt-4 text-xl font-bold text-[var(--text-muted)]">:</span>

              {/* Minute */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[var(--text-muted)]">Menit</span>
                <button type="button" onClick={() => stepM(1)} className="inline-flex h-7 w-12 items-center justify-center rounded bg-[var(--bg-app)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)]" aria-label="Tambah menit">
                  <ChevronUp size={14} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={mInput}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                    setMInput(v);
                    if (v !== '') {
                      const n = Math.min(59, Math.max(0, parseInt(v, 10) || 0));
                      if (v.length === 2) {
                        setDraftM(n);
                        commit(draftH, n);
                      }
                    }
                  }}
                  onBlur={() => {
                    const n = Math.min(59, Math.max(0, parseInt(mInput, 10) || 0));
                    setDraftM(n);
                    setMInput(String(n).padStart(2, '0'));
                    commit(draftH, n);
                  }}
                  className="h-10 w-12 rounded border border-[var(--border-main)] bg-[var(--bg-app)] text-center text-lg font-bold text-[var(--text-bright)] outline-none focus:border-[var(--accent-cyan)]"
                />
                <button type="button" onClick={() => stepM(-1)} className="inline-flex h-7 w-12 items-center justify-center rounded bg-[var(--bg-app)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)]" aria-label="Kurangi menit">
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[var(--border-main)]/50 pt-2">
              <button type="button" onClick={() => { const now = new Date(); const h = now.getHours(); const m = now.getMinutes(); setDraftH(h); setDraftM(m); setHInput(String(h).padStart(2,'0')); setMInput(String(m).padStart(2,'0')); commit(h,m); }} className="text-[11px] font-bold text-[var(--accent-cyan)] hover:underline">
                Sekarang
              </button>
              <button type="button" onClick={() => setOpen(false)} className="terminal-button py-1 text-[11px]">
                Tutup
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
