'use client';

import { useState } from 'react';
import { useTermFlowStore } from '@/lib/store';

export default function TerminalLogView() {
  const { activityLogs } = useTermFlowStore();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-[var(--border-main)] rounded-lg bg-[var(--bg-app)] text-xs font-mono overflow-hidden transition-all duration-200 shadow-md">
      {/* Log Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-main)]/50 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-muted)] transition-colors select-none"
      >
        <div className="flex items-center space-x-2">
          <span className="text-[var(--accent-cyan)] font-bold">git log --oneline</span>
          <span className="text-[10px] bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] px-1.5 py-0.5 rounded border border-[var(--accent-purple)]/30">
            {activityLogs.length} events
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[var(--text-muted)] text-[11px]">
          <span>{activityLogs[0]?.timestamp || '10:00:00'}</span>
          <span>{isExpanded ? '▼ collapse' : '▲ expand log stream'}</span>
        </div>
      </div>

      {/* Log Stream Content */}
      <div className={`p-3 space-y-1.5 max-h-48 overflow-y-auto ${isExpanded ? 'block' : 'h-16'}`}>
        {activityLogs.map((log) => (
          <div key={log.id} className="flex items-center space-x-2 text-[11px] leading-relaxed">
            <span className="text-[var(--accent-yellow)] font-bold">[{log.timestamp}]</span>
            <span className="text-[var(--accent-cyan)] font-mono hover:underline cursor-pointer">
              commit {log.commitHash}
            </span>
            <span className="text-[var(--text-main)]">- {log.message}</span>
            <span className="text-[var(--accent-purple)]">(@{log.user})</span>
          </div>
        ))}

        {activityLogs.length === 0 && (
          <div className="text-[var(--text-muted)] text-center py-2">
            No recent git logs in terminal session.
          </div>
        )}
      </div>
    </div>
  );
}

