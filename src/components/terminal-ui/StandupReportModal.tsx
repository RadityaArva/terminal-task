'use client';

import { useMemo } from 'react';
import { useTermFlowStore } from '@/lib/store';

export default function StandupReportModal({ period, onClose }: { period: 'today' | 'week'; onClose: () => void }) {
  const { tasks } = useTermFlowStore();
  const report = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === 'today') start.setHours(0, 0, 0, 0);
    else {
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day + 1);
      start.setHours(0, 0, 0, 0);
    }
    const relevant = tasks.filter((task) => new Date(task.createdAt) >= start || (task.completedAt && new Date(task.completedAt) >= start));
    const done = relevant.filter((task) => task.status === 'done');
    const active = relevant.filter((task) => task.status === 'in_progress' || task.status === 'review');
    const today = now.toISOString().slice(0, 10);
    const blocked = tasks.filter((task) => task.status !== 'done' && task.dueDate < today);
    return `# TermFlow Standup (${period})\n\n_Generated ${now.toLocaleString()}_\n\n## Done\n${done.map((task) => `- ${task.title}`).join('\n') || '- None'}\n\n## In progress\n${active.map((task) => `- ${task.title} (${task.status.replace('_', ' ')})`).join('\n') || '- None'}\n\n## Blockers / overdue\n${blocked.map((task) => `- ${task.title} (due ${task.dueDate})`).join('\n') || '- None'}`;
  }, [period, tasks]);
  const download = () => {
    const anchor = document.createElement('a');
    anchor.href = `data:text/markdown;charset=utf-8,${encodeURIComponent(report)}`;
    anchor.download = `termflow-standup-${period}-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };
  const copy = async () => {
    await navigator.clipboard.writeText(report);
  };
  return <div className="terminal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}><section className="terminal-modal w-full max-w-2xl rounded-lg border border-[var(--accent-cyan)] bg-[var(--bg-surface)] p-4" onClick={(event) => event.stopPropagation()}><div className="mb-3 flex items-center justify-between"><strong className="text-[var(--accent-cyan)]">&gt; report {period}</strong><button type="button" onClick={onClose} className="terminal-button">×</button></div><textarea readOnly value={report} className="terminal-input min-h-72 w-full resize-y text-xs leading-6" /><div className="mt-3 flex justify-end gap-2"><button type="button" onClick={copy} className="terminal-button terminal-button-primary">Copy Markdown</button><button type="button" onClick={download} className="terminal-button">Export .md</button></div></section></div>;
}
