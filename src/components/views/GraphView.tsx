'use client';

import { useMemo, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, CircleDot, GitBranch, AlertTriangle } from 'lucide-react';
import { useTermFlowStore, Task } from '@/lib/store';

interface GraphViewProps {
  onSelectTask: (id: string) => void;
}

// Threshold deadline
const DEADLINE_URGENT_DAYS = 1; // <1 hari = merah
const DEADLINE_WARN_DAYS = 3; // <3 hari = kuning, sisanya abu pudar, done = hijau

function daysUntil(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const due = new Date(`${dateStr.slice(0, 10)}T00:00:00`);
  if (isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

type DeadlineTone = 'urgent' | 'warn' | 'muted' | 'done';

function toneFor(task: Task): DeadlineTone {
  if (task.status === 'done') return 'done';
  const d = daysUntil(task.dueDate || task.endDate);
  if (d === null) return 'muted';
  if (d < DEADLINE_URGENT_DAYS) return 'urgent';
  if (d < DEADLINE_WARN_DAYS) return 'warn';
  return 'muted';
}

const TONE_STYLE: Record<DeadlineTone, { border: string; glow: string; label: string }> = {
  urgent: { border: '#ef4444', glow: '0 0 18px rgba(239,68,68,0.7)', label: `Merah — <${DEADLINE_URGENT_DAYS} hari / lewat` },
  warn: { border: '#eab308', glow: '0 0 16px rgba(234,179,8,0.55)', label: `Kuning — <${DEADLINE_WARN_DAYS} hari` },
  muted: { border: 'rgba(148,163,184,0.45)', glow: '0 0 10px rgba(100,116,139,0.22)', label: 'Abu — masih aman (>3 hari)' },
  done: { border: '#22c55e', glow: '0 0 16px rgba(34,197,94,0.6)', label: 'Hijau — selesai' },
};

const NODE_W = 176;
const NODE_H = 56;

export default function GraphView({ onSelectTask }: GraphViewProps) {
  const { activeBoardId, boards, tasks, searchFilter, selectedTaskId } = useTermFlowStore();
  const [zoom, setZoom] = useState(1);
  const activeBoard = boards.find((b) => b.id === activeBoardId) || null;

  const visibleTasks = useMemo(() => {
    let base = tasks.filter((t) => !activeBoardId || t.boardId === activeBoardId);
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      base = base.filter((t) => [t.title, t.description, t.status, t.priority, ...t.labels].some((v) => v.toLowerCase().includes(q)));
    }
    return base;
  }, [tasks, activeBoardId, searchFilter]);

  const layout = useMemo(() => {
    const n = visibleTasks.length;
    const cx = 340;
    const cy = 300;
    const radius = n <= 1 ? 0 : Math.max(160, Math.min(280, 110 + n * 22));
    const positions = new Map<string, { x: number; y: number; angle: number }>();
    visibleTasks.forEach((task, i) => {
      if (n === 1) {
        positions.set(task.id, { x: cx, y: cy + radius, angle: Math.PI / 2 });
        return;
      }
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      positions.set(task.id, { x, y, angle });
    });
    const width = 680;
    const height = 600;
    return { cx, cy, radius, positions, width, height };
  }, [visibleTasks]);

  const dependencyEdges = useMemo(() => {
    const ids = new Set(visibleTasks.map((t) => t.id));
    const edges: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }> = [];
    visibleTasks.forEach((task) => {
      (task.dependencyIds || []).forEach((depId) => {
        if (!ids.has(depId)) return;
        const a = layout.positions.get(depId);
        const b = layout.positions.get(task.id);
        if (!a || !b) return;
        edges.push({ from: a, to: b });
      });
    });
    return edges;
  }, [visibleTasks, layout.positions]);

  if (visibleTasks.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-bold text-[var(--accent-main)]">
              <GitBranch size={16} /> task-dependencies — radial
            </h1>
            <p className="text-xs text-[var(--text-muted)]">Belum ada task di board ini untuk divisualisasi.</p>
          </div>
        </div>
        <div className="rounded-lg border border-dashed border-[var(--border-main)] p-10 text-center text-xs text-[var(--text-muted)]">
          Board <span className="font-bold text-[var(--text-bright)]">{activeBoard?.name || '—'}</span> belum punya task. Buat task dulu untuk melihat radial hub-and-spoke.
        </div>
      </section>
    );
  }

  const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-sm font-bold text-[var(--accent-main)] sm:text-lg">
            <GitBranch size={16} strokeWidth={1.75} aria-hidden /> task-dependencies — radial
          </h1>
          <p className="max-w-xl text-[11px] leading-relaxed text-[var(--text-muted)] sm:text-xs">
            Pusat = board <span className="font-bold text-[var(--text-bright)]">{activeBoard?.name || activeBoardId || '—'}</span>. Warna node = urgensi deadline.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setZoom((v) => Number(Math.max(0.6, v - 0.1).toFixed(1)))} className="terminal-button p-2" aria-label="Zoom out">
            <ZoomOut size={14} aria-hidden />
          </button>
          <span className="min-w-10 text-center font-mono text-[10px] text-[var(--text-muted)]">{zoom.toFixed(1)}x</span>
          <button type="button" onClick={() => setZoom((v) => Number(Math.min(1.8, v + 0.1).toFixed(1)))} className="terminal-button p-2" aria-label="Zoom in">
            <ZoomIn size={14} aria-hidden />
          </button>
          <button type="button" onClick={() => setZoom(1)} className="terminal-button px-2.5 py-2 text-xs">
            <Maximize2 size={12} className="mr-1 inline" aria-hidden /> Fit
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border-main)]/60 bg-[var(--bg-surface)] px-3 py-2 text-[10px] sm:text-xs">
        <span className="inline-flex items-center gap-1.5 font-bold tracking-wide text-[var(--text-muted)]">
          <CircleDot size={12} strokeWidth={1.75} aria-hidden /> Legend
        </span>
        <span className="hidden h-3 w-px bg-[var(--border-main)]/50 sm:block" aria-hidden />
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: TONE_STYLE.urgent.border, boxShadow: TONE_STYLE.urgent.glow }} aria-hidden /> Merah &lt;{DEADLINE_URGENT_DAYS} hari</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: TONE_STYLE.warn.border, boxShadow: TONE_STYLE.warn.glow }} aria-hidden /> Kuning &lt;{DEADLINE_WARN_DAYS} hari</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border" style={{ borderColor: TONE_STYLE.muted.border, background: 'rgba(148,163,184,0.18)' }} aria-hidden /> Abu pudar — aman</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: TONE_STYLE.done.border, boxShadow: TONE_STYLE.done.glow }} aria-hidden /> Hijau — selesai</span>
      </div>

      {isMobileViewport ? (
        <div className="space-y-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-3">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border-main)]/50 bg-[var(--bg-app)] px-3 py-2 text-xs font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border text-sm" style={{ background: activeBoard ? `${activeBoard.color}18` : undefined, borderColor: activeBoard?.color || 'var(--border-main)', color: activeBoard?.color }} aria-hidden>{activeBoard?.icon || '📋'}</span>
            <span className="truncate text-[var(--text-bright)]">{activeBoard?.name || 'Board'}</span>
            <span className="ml-auto text-[10px] font-normal text-[var(--text-muted)]">{visibleTasks.length} tasks</span>
          </div>
          {visibleTasks.map((task) => {
            const tone = toneFor(task);
            const s = TONE_STYLE[tone];
            const d = daysUntil(task.dueDate || task.endDate);
            return (
              <button key={task.id} type="button" onClick={() => onSelectTask(task.id)} className="w-full rounded-lg border bg-[var(--bg-app)] p-3 text-left transition hover:border-[var(--accent-cyan)]/50" style={{ borderColor: s.border, boxShadow: s.glow === 'none' ? undefined : s.glow, opacity: tone === 'muted' ? 0.92 : 1 }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-bold" style={{ color: tone === 'muted' ? 'var(--text-muted)' : tone === 'done' ? '#22c55e' : 'var(--text-bright)' }}>{task.title}</span>
                  <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold" style={{ borderColor: s.border, color: s.border, background: tone === 'muted' ? 'rgba(148,163,184,0.12)' : tone === 'done' ? 'rgba(34,197,94,0.12)' : undefined }}>{task.id}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                  <span>{task.status.replace('_', ' ')}</span>
                  <span>·</span>
                  <span className={tone === 'urgent' ? 'font-bold text-[#ef4444]' : tone === 'warn' ? 'font-bold text-[#eab308]' : tone === 'done' ? 'font-bold text-[#22c55e]' : 'text-[var(--text-muted)]'}>
                    due {task.dueDate || task.endDate || '—'} {d !== null ? `(${d >= 0 ? `${d}h lagi` : 'lewat'})` : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="relative overflow-auto rounded-xl border border-[var(--border-main)] bg-[var(--bg-app)] p-3 sm:p-4">
          {/* Full terminal background — mengisi penuh seluruh container, ter-clip rapi di rounded-xl */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            {/* radial ambient */}
            <div className="absolute inset-0 opacity-[0.6]" style={{ background: `radial-gradient(ellipse 85% 75% at 50% 50%, color-mix(in srgb, var(--accent-cyan) 12%, transparent) 0%, transparent 65%), radial-gradient(ellipse 65% 55% at 50% 50%, color-mix(in srgb, var(--accent-main) 8%, transparent) 0%, transparent 68%)` }} />
            {/* full grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.16]"
              style={{
                backgroundImage: `linear-gradient(to right, color-mix(in srgb, var(--border-main) 40%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--border-main) 30%, transparent) 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
              }}
            />
            {/* subtle dots */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, var(--text-muted) 1px, transparent 0)`,
                backgroundSize: '16px 16px',
              }}
            />
            {/* scanlines */}
            <div className="absolute inset-0 opacity-[0.05]" style={{ background: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, color-mix(in srgb, var(--accent-cyan) 55%, transparent) 3px)` }} />
          </div>

          <div className="relative mx-auto" style={{ width: Math.max(layout.width * zoom, 680), height: Math.max(layout.height * zoom, 600) }}>
            <svg viewBox={`0 0 ${layout.width} ${layout.height}`} className="absolute inset-0 h-full w-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} role="img" aria-label="Radial dependency graph">
              <defs>
                <marker id="radial-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="var(--border-main)" opacity={0.9} />
                </marker>
                <radialGradient id="hub-grad" cx="50%" cy="50%" r="62%">
                  <stop offset="0%" stopColor="var(--bg-surface)" />
                  <stop offset="100%" stopColor="var(--bg-app)" />
                </radialGradient>
                <filter id="glow-urgent"><feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#ef4444" floodOpacity="0.7" /></filter>
                <filter id="glow-warn"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#eab308" floodOpacity="0.6" /></filter>
                <filter id="glow-done"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#22c55e" floodOpacity="0.6" /></filter>
              </defs>

              {/* spokes: board center -> each task */}
              {visibleTasks.map((task) => {
                const p = layout.positions.get(task.id)!;
                return <line key={`spoke-${task.id}`} x1={layout.cx} y1={layout.cy} x2={p.x} y2={p.y} stroke="var(--border-main)" strokeOpacity={0.32} strokeWidth={1} strokeDasharray="6 4" />;
              })}

              {/* dependency edges between tasks */}
              {dependencyEdges.map((e, i) => {
                const dx = e.to.x - e.from.x;
                const dy = e.to.y - e.from.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                return (
                  <path
                    key={`dep-${i}`}
                    d={`M ${e.from.x} ${e.from.y} L ${e.to.x} ${e.to.y}`}
                    fill="none"
                    stroke="var(--accent-cyan)"
                    strokeOpacity={0.6}
                    strokeWidth={2}
                    strokeDasharray="8 6"
                    className="animate-pulse"
                    style={{ filter: 'drop-shadow(0 0 4px var(--accent-cyan))' }}
                  />
                );
              })}

              {/* hub node — board name (netral) */}
              <g transform={`translate(${layout.cx}, ${layout.cy})`} role="img" aria-label={`Board ${activeBoard?.name || ''}`}>
                <circle r={50} fill="url(#hub-grad)" stroke="var(--accent-cyan)" strokeWidth={2.5} />
                <circle r={54} fill="none" stroke="var(--accent-cyan)" strokeOpacity={0.14} strokeWidth={8} />
                <circle r={62} fill="none" stroke="var(--accent-cyan)" strokeOpacity={0.06} strokeWidth={1} strokeDasharray="3 4" />
                <text textAnchor="middle" dy={-6} fill="var(--text-bright)" fontSize="11" fontWeight="800" fontFamily="ui-monospace">{(activeBoard?.name || 'BOARD').slice(0, 14).toUpperCase()}</text>
                <text textAnchor="middle" dy={10} fill="var(--text-muted)" fontSize="9" fontWeight={600}>{visibleTasks.length} tasks</text>
                <text textAnchor="middle" dy={22} fill="var(--accent-cyan)" fontSize="8">{activeBoard?.icon || '📋'}</text>
              </g>

              {/* task nodes */}
              {visibleTasks.map((task) => {
                const p = layout.positions.get(task.id)!;
                const tone = toneFor(task);
                const style = TONE_STYLE[tone];
                const isSelected = task.id === selectedTaskId;
                const label = task.title.length > 18 ? `${task.title.slice(0, 17)}…` : task.title;
                const filterId = tone === 'urgent' ? 'url(#glow-urgent)' : tone === 'warn' ? 'url(#glow-warn)' : tone === 'done' ? 'url(#glow-done)' : undefined;
                const borderColor = style.border;
                const isMuted = tone === 'muted';
                return (
                  <g
                    key={task.id}
                    transform={`translate(${p.x}, ${p.y})`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open task ${task.title}`}
                    onClick={() => onSelectTask(task.id)}
                    className="cursor-pointer"
                    style={{ opacity: isMuted ? 0.78 : 1 }}
                  >
                    <rect
                      x={-NODE_W / 2}
                      y={-NODE_H / 2}
                      width={NODE_W}
                      height={NODE_H}
                      rx={10}
                      fill={isSelected ? 'var(--bg-muted)' : isMuted ? 'color-mix(in srgb, var(--bg-app) 88%, var(--bg-surface))' : 'var(--bg-app)'}
                      stroke={borderColor}
                      strokeWidth={isSelected ? 2.4 : isMuted ? 1.1 : 2}
                      strokeOpacity={isMuted ? 0.9 : 1}
                      filter={filterId}
                    />
                    <text x={-NODE_W / 2 + 10} y={-8} fill={isMuted ? 'var(--text-muted)' : 'var(--text-bright)'} fontSize="11" fontWeight={isMuted ? 600 : 700}>{label}</text>
                    <text x={-NODE_W / 2 + 10} y={8} fill="var(--text-muted)" fontSize="9">{task.id} · {task.status.replace('_', ' ')}</text>
                    <text x={-NODE_W / 2 + 10} y={20} fill={tone === 'done' ? '#22c55e' : tone === 'urgent' ? '#ef4444' : tone === 'warn' ? '#eab308' : 'var(--text-muted)'} fontSize="8" fontWeight={tone === 'muted' ? 400 : 700}>
                      {task.dueDate || task.endDate ? `due ${task.dueDate || task.endDate}` : 'no due date'}
                    </text>
                    {isSelected && <circle r={3} cx={NODE_W / 2 - 10} cy={-NODE_H / 2 + 10} fill="var(--accent-cyan)" />}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </section>
  );
}
