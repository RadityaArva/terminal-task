'use client';

import { useState } from 'react';
import { useTermFlowStore } from '@/lib/store';
import { GitBranch, ChevronDown } from 'lucide-react';

export default function TerminalLogView() {
  const { activityLogs } = useTermFlowStore();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-main)] bg-[var(--bg-app)] font-mono text-xs shadow-md transition-all duration-200">
      {/* Log Header: Desktop single row nowrap, Mobile/Tablet 2-row layout without overlapping */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="flex cursor-pointer flex-col gap-2 border-b border-[var(--border-main)]/50 bg-[var(--bg-surface)] px-3 py-2.5 transition-colors hover:bg-[var(--bg-muted)] select-none sm:flex-row sm:items-center sm:justify-between sm:gap-3"
      >
        {/* Row 1 / Left: Title + badge count with proper spacing */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-[var(--accent-cyan)]">
            <GitBranch size={13} strokeWidth={2} aria-hidden />
            <span>git log --oneline</span>
          </span>
          <span className="rounded-full border border-[var(--accent-purple)]/40 bg-[var(--accent-purple)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-purple)]">
            {activityLogs.length} events
          </span>
        </div>

        {/* Row 2 / Right: Timestamp + toggle expand, right-aligned, no overlap */}
        <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--text-muted)] sm:justify-end">
          <span className="font-mono text-[10px] sm:text-[11px]">{activityLogs[0]?.timestamp || '10:00:00'}</span>
          <span className="inline-flex items-center gap-1 font-bold text-[var(--accent-cyan)]">
            <span>{isExpanded ? 'collapse' : 'expand log stream'}</span>
            <ChevronDown
              size={12}
              strokeWidth={2}
              aria-hidden
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </span>
        </div>
      </div>

      {/* Log Stream Content: responsive wrapped rows per entry */}
      <div className={`space-y-2 p-3 ${isExpanded ? 'max-h-80 overflow-y-auto' : 'max-h-24 overflow-hidden'}`}>
        {activityLogs.map((log) => (
          <div
            key={log.id}
            className="flex flex-col gap-1 rounded border border-[var(--border-main)]/30 bg-[var(--bg-surface)]/30 p-2 text-[11px] sm:flex-row sm:items-center sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0"
          >
            {/* Mobile line 1: timestamp + commit */}
            <div className="flex shrink-0 items-center gap-1.5 font-mono">
              <span className="font-bold text-[var(--accent-yellow)]">[{log.timestamp}]</span>
              <span className="text-[var(--accent-cyan)] hover:underline">
                commit {log.commitHash.slice(0, 7)}
              </span>
            </div>

            {/* Message: line 2 on mobile, flex-1 on desktop */}
            <div className="min-w-0 flex-1 truncate text-[var(--text-main)]" title={log.message}>
              <span className="text-[var(--text-muted)] sm:hidden">$ </span>
              {log.message}
            </div>

            {/* Author: line 3 on mobile or far right */}
            <div className="shrink-0 text-[10px] font-semibold text-[var(--accent-purple)] sm:text-[11px]">
              @{log.user}
            </div>
          </div>
        ))}

        {activityLogs.length === 0 && (
          <div className="py-3 text-center text-xs text-[var(--text-muted)]">
            No recent git logs in terminal session.
          </div>
        )}
      </div>
    </div>
  );
}
