'use client';

import { useTermFlowStore, TaskStatus } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';

interface ListViewProps {
  onSelectTask: (id: string) => void;
  selectedTaskId: string | null;
}

export default function ListView({ onSelectTask, selectedTaskId }: ListViewProps) {
  const { tasks, activeProjectId, moveTaskStatus, searchFilter, lang } = useTermFlowStore();

  const filteredTasks = tasks.filter((t) => {
    if (t.projectId !== activeProjectId) return false;
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.labels.some((l) => l.toLowerCase().includes(q)) ||
      t.assignee.toLowerCase().includes(q) ||
      t.priority.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg p-4 font-mono text-xs shadow-md space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-main)] text-[var(--text-muted)] text-[11px]">
        <span>TASK LIST ({filteredTasks.length} ITEMS)</span>
        <span>USE J/K TO NAVIGATE | ENTER TO VIEW</span>
      </div>

      <div className="divide-y divide-[var(--border-main)]/40">
        {filteredTasks.map((t) => {
          const isSelected = t.id === selectedTaskId;
          const isDone = t.status === 'done';

          return (
            <div
              key={t.id}
              onClick={() => onSelectTask(t.id)}
              className={`py-3 px-3 rounded flex flex-wrap items-center justify-between gap-3 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-[var(--bg-muted)] border-l-4 border-[var(--accent-cyan)] font-bold text-[var(--text-bright)]'
                  : 'hover:bg-[var(--bg-muted)]/50 text-[var(--text-main)]'
              }`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
                {/* Checkbox toggle */}
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={(e) => {
                    e.stopPropagation();
                    moveTaskStatus(t.id, isDone ? 'todo' : 'done');
                  }}
                  className="accent-[var(--accent-main)] cursor-pointer w-4 h-4"
                />

                <span className="text-[var(--accent-purple)] font-bold">{t.id}</span>

                <span className={`text-sm ${isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-bright)]'}`}>
                  {t.title}
                </span>

                {t.labels.length > 0 && (
                  <div className="flex items-center space-x-1">
                    {t.labels.map((l, i) => (
                      <span key={i} className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-app)] border border-[var(--border-main)] px-1.5 py-0.5 rounded">
                        #{l}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status & Priority Controls */}
              <div className="flex items-center space-x-4 text-[11px]">
                <select
                  value={t.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    moveTaskStatus(t.id, e.target.value as TaskStatus);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[var(--bg-app)] border border-[var(--border-main)] rounded px-2 py-1 text-[var(--accent-cyan)] font-bold focus:outline-none"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>

                <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold ${
                  t.priority === 'urgent' ? 'border-[var(--accent-red)] text-[var(--accent-red)]' :
                  t.priority === 'high' ? 'border-[var(--accent-yellow)] text-[var(--accent-yellow)]' :
                  t.priority === 'medium' ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)]' :
                  'border-[var(--text-muted)] text-[var(--text-muted)]'
                }`}>
                  {getTranslation(`priority.${t.priority}`, lang)}
                </span>

                <span className="text-[var(--accent-purple)]">@{t.assignee}</span>

                {t.dueDate && (
                  <span className="text-[var(--text-muted)]">📅 {t.dueDate}</span>
                )}
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="py-8 text-center text-[var(--text-muted)]">
            No tasks match the filter.
          </div>
        )}
      </div>
    </div>
  );
}

