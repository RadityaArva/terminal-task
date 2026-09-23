'use client';

import { useTermFlowStore } from '@/lib/store';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

export default function DeadlineNotice() {
  const { tasks, notificationSettings, setSelectedTaskId } = useTermFlowStore();
  const [now] = useState(() => Date.now());
  if (!notificationSettings.enabled) return null;
  const upcoming = tasks.filter((task) => {
    if (task.status === 'done' || !task.dueDate) return false;
    const deadline = new Date(`${task.dueDate}T${task.dueTime || '23:59'}:00`).getTime();
    return deadline >= now && deadline - now <= notificationSettings.reminderMinutes * 60_000;
  });
  if (!upcoming.length) return null;
  return <div className="border-b border-[var(--accent-yellow)]/40 bg-[var(--accent-yellow)]/10 px-4 py-2 text-xs text-[var(--accent-yellow)]"><span className="font-bold">⚠ deadline notice:</span>{' '} {upcoming.map((task) => <button key={task.id} onClick={() => setSelectedTaskId(task.id)} className="ml-2 underline hover:text-[var(--text-bright)]">[{task.id}] {task.title}</button>)}</div>;
}
