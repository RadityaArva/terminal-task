'use client';

import { useState } from 'react';
import { useTermFlowStore } from '@/lib/store';
import { Plus, Pencil, Trash2, GitMerge, ArrowRightLeft, Timer, MessageSquare, Hash, Clock } from 'lucide-react';

export interface TimelineLog {
  id: string;
  timestamp: string;
  commitHash: string;
  message: string;
  user: string;
  taskId?: string;
}

function getActionMeta(message: string) {
  const m = message.toLowerCase();
  if (m.includes('created') || m.startsWith('created task')) {
    return { label: 'membuat', type: 'created' as const, color: 'text-[var(--accent-main)] border-[var(--accent-main)]/30 bg-[var(--accent-main)]/10', dot: 'bg-[var(--accent-main)]', Icon: Plus };
  }
  if (m.includes('deleted') || m.includes('hapus') || m.includes('bulkdelete')) {
    return { label: 'menghapus', type: 'deleted' as const, color: 'text-[var(--accent-red)] border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10', dot: 'bg-[var(--accent-red)]', Icon: Trash2 };
  }
  if (m.includes('merged') || m.includes('pr #') || m.includes('pull')) {
    return { label: 'merge', type: 'merged' as const, color: 'text-[var(--accent-purple)] border-[var(--accent-purple)]/30 bg-[var(--accent-purple)]/10', dot: 'bg-[var(--accent-purple)]', Icon: GitMerge };
  }
  if (m.includes('moved') || m.includes('status') || m.includes('->')) {
    return { label: 'status', type: 'status' as const, color: 'text-[var(--accent-cyan)] border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/10', dot: 'bg-[var(--accent-cyan)]', Icon: ArrowRightLeft };
  }
  if (m.includes('focus') || m.includes('session')) {
    return { label: 'fokus', type: 'focus' as const, color: 'text-[var(--accent-yellow)] border-[var(--accent-yellow)]/30 bg-[var(--accent-yellow)]/10', dot: 'bg-[var(--accent-yellow)]', Icon: Timer };
  }
  if (m.includes('comment') || m.includes('added subtask')) {
    return { label: 'update', type: 'updated' as const, color: 'text-[var(--accent-cyan)] border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/10', dot: 'bg-[var(--accent-cyan)]', Icon: MessageSquare };
  }
  if (m.includes('updated')) {
    return { label: 'mengubah', type: 'updated' as const, color: 'text-[var(--accent-cyan)] border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/10', dot: 'bg-[var(--accent-cyan)]', Icon: Pencil };
  }
  return { label: 'aktivitas', type: 'default' as const, color: 'text-[var(--text-muted)] border-[var(--border-main)] bg-[var(--bg-muted)]', dot: 'bg-[var(--border-main)]', Icon: Hash };
}

function getRelativeTime(timestamp: string): string {
  try {
    let date: Date | null = null;
    // ISO or full date
    if (timestamp.includes('T') || timestamp.includes('-')) {
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) date = d;
    }
    // HH:MM:SS today
    if (!date && /^\d{1,2}:\d{2}(:\d{2})?$/.test(timestamp)) {
      const now = new Date();
      const [h, m, s] = timestamp.split(':').map(Number);
      const d = new Date(now);
      d.setHours(h, m ?? 0, s ?? 0, 0);
      // if time is in future (e.g. now 09:00, log 23:00 = yesterday), shift back one day
      if (d.getTime() > now.getTime() + 60_000) d.setDate(d.getDate() - 1);
      date = d;
    }
    if (!date) return timestamp;
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) return 'baru saja';
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} jam lalu`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  } catch {
    return timestamp;
  }
}

export default function ActivityTimeline({ logs }: { logs: TimelineLog[] }) {
  const profile = useTermFlowStore((s) => s.profile);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (logs.length === 0) {
    return <div className="py-8 text-center text-xs text-[var(--text-muted)]">Belum ada aktivitas — mulai buat atau ubah task.</div>;
  }

  return (
    <div className="relative">
      {/* vertical connector line */}
      <div className="pointer-events-none absolute left-[15px] top-3 bottom-3 w-px bg-[var(--border-main)]/40 max-sm:left-[15px]" aria-hidden />
      <div className="space-y-0">
        {logs.map((log) => {
          const meta = getActionMeta(log.message);
          const Icon = meta.Icon;
          const isLong = log.message.length > 72;
          const isExpanded = expanded.has(log.id);
          const relative = getRelativeTime(log.timestamp);
          const isRadit = log.user.toLowerCase() === profile.username.toLowerCase() || log.user.toLowerCase() === 'radit';
          const avatarUrl = isRadit ? profile.avatarUrl : '';
          const initial = log.user.charAt(0).toUpperCase();

          return (
            <div
              key={log.id}
              className="group relative flex gap-3 rounded-lg px-1 py-2.5 pl-8 transition-colors hover:bg-[var(--bg-muted)]/40 max-sm:pl-8"
            >
              {/* dot / avatar on timeline */}
              <div className="absolute left-1 top-3.5 flex h-6 w-6 items-center justify-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border bg-[var(--bg-app)] text-[10px] font-bold shadow-sm ${meta.color} max-sm:h-6 max-sm:w-6`}
                  title={log.user}
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={log.user} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="leading-none">{initial}</span>
                  )}
                </div>
                {/* small dot halo */}
                <span className={`pointer-events-none absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-app)] ${meta.dot}`} aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                {/* row 1: user • action • target • time */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] leading-none">
                  <span className="font-bold text-[var(--text-bright)]">@{log.user}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-bold leading-none ${meta.color}`}>
                    <Icon size={10} strokeWidth={2} aria-hidden />
                    <span>{meta.label}</span>
                  </span>
                  {log.taskId && (
                    <span className="inline-flex items-center gap-1 rounded bg-[var(--bg-muted)] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--accent-purple)]">
                      <Hash size={10} strokeWidth={2} aria-hidden />
                      <span>{log.taskId}</span>
                    </span>
                  )}
                  <span className="text-[var(--text-muted)]">·</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                    <Clock size={10} strokeWidth={1.75} aria-hidden />
                    <span>{relative}</span>
                  </span>
                  <span className="ml-auto hidden items-center gap-1 font-mono text-[10px] text-[var(--text-muted)] sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-cyan)]/60" aria-hidden />
                    {log.commitHash.slice(0, 7)}
                  </span>
                </div>

                {/* row 2: message */}
                <p
                  className={`mt-1.5 text-[12px] leading-5 text-[var(--text-main)] ${isExpanded ? 'whitespace-pre-wrap break-words' : 'truncate'}`}
                  title={log.message}
                >
                  <span className="text-[var(--text-muted)]">$</span> <span className={!isExpanded ? 'truncate' : ''}>{log.message}</span>
                </p>

                {(isLong || log.message.length > 40) && (
                  <button
                    type="button"
                    onClick={() => toggle(log.id)}
                    className="mt-1 inline-flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-bold text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 hover:text-[var(--accent-cyan)]"
                  >
                    {isExpanded ? 'sembunyikan' : 'lihat detail'}
                    <span aria-hidden className={`transition ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
