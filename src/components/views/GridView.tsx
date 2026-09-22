'use client';

import { useTermFlowStore, TaskStatus, TaskPriority } from '@/lib/store';

interface GridViewProps {
  onSelectTask: (id: string) => void;
  selectedTaskId: string | null;
}

export default function GridView({ onSelectTask, selectedTaskId }: GridViewProps) {
  const { tasks, activeProjectId, moveTaskStatus, updateTask, searchFilter } = useTermFlowStore();

  const filteredTasks = tasks.filter((t) => {
    if (t.projectId !== activeProjectId) return false;
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    if (q.startsWith('energy:')) return (t.energyLevel || 'medium') === q.slice(7);
    return (
      t.title.toLowerCase().includes(q) ||
      t.labels.some((l) => l.toLowerCase().includes(q)) ||
      t.assignee.toLowerCase().includes(q)
    );
  });

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] font-mono text-xs shadow-md">
      <div className="space-y-3 p-3 sm:hidden">
        {filteredTasks.map((task) => {
          const completed = task.subtasks.filter((subtask) => subtask.completed).length;
          const progress = task.subtasks.length ? Math.round((completed / task.subtasks.length) * 100) : task.status === 'done' ? 100 : 0;
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(task.id)}
              className="min-h-[44px] w-full rounded border border-[var(--border-main)] bg-[var(--bg-app)] p-3 text-left transition hover:border-[var(--accent-cyan)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0 truncate font-bold text-[var(--text-bright)]">{task.title}</span>
                <span className="shrink-0 text-[10px] text-[var(--accent-purple)]">{task.id}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[var(--text-muted)]">
                <span>{task.status.replace('_', ' ')}</span>
                <span>{task.priority}</span>
                <span>@{task.assignee}</span>
                <span>due {task.dueDate || '-'}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                <div className="h-full bg-[var(--accent-cyan)]" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-1 text-right text-[10px] text-[var(--accent-cyan)]">{progress}%</div>
            </button>
          );
        })}
        {filteredTasks.length === 0 && <div className="rounded border border-dashed border-[var(--border-main)] p-6 text-center text-[var(--text-muted)]">No task records found.</div>}
      </div>
      <div className="overflow-x-auto">
        <table className="hidden w-full border-collapse text-left sm:table">
          <thead>
            <tr className="bg-[var(--bg-app)] border-b border-[var(--border-main)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider">
              <th className="p-3 border-r border-[var(--border-main)]/50">ID</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Title</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Status</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Priority</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Assignee</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Checklist</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Progress</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Due Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-main)]/40">
            {filteredTasks.map((t) => {
              const isSelected = t.id === selectedTaskId;
              const completedCount = t.subtasks.filter(s => s.completed).length;
              const progress = t.subtasks.length > 0
                ? Math.round((completedCount / t.subtasks.length) * 100)
                : t.status === 'done' ? 100 : 0;

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTask(t.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[var(--bg-muted)] font-bold text-[var(--text-bright)]'
                      : 'hover:bg-[var(--bg-muted)]/50 text-[var(--text-main)]'
                  }`}
                >
                  <td className="p-3 font-bold text-[var(--accent-purple)] border-r border-[var(--border-main)]/30 whitespace-nowrap">
                    {t.id}
                  </td>
                  <td className="p-3 border-r border-[var(--border-main)]/30 font-semibold text-[var(--text-bright)] max-w-xs truncate">
                    {t.title}
                  </td>
                  <td className="p-3 border-r border-[var(--border-main)]/30 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={t.status}
                      onChange={(e) => moveTaskStatus(t.id, e.target.value as TaskStatus)}
                      className="bg-[var(--bg-app)] border border-[var(--border-main)] rounded px-2 py-1 text-[var(--accent-cyan)] font-bold focus:outline-none"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td className="p-3 border-r border-[var(--border-main)]/30 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={t.priority}
                      onChange={(e) => updateTask(t.id, { priority: e.target.value as TaskPriority })}
                      className="bg-[var(--bg-app)] border border-[var(--border-main)] rounded px-2 py-1 text-[var(--accent-yellow)] font-bold focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </td>
                  <td className="p-3 border-r border-[var(--border-main)]/30 text-[var(--accent-purple)] font-bold whitespace-nowrap">
                    @{t.assignee}
                  </td>
                  <td className="p-3 border-r border-[var(--border-main)]/30 whitespace-nowrap">
                    [{completedCount}/{t.subtasks.length}]
                  </td>
                  <td className="min-w-44 p-3 border-r border-[var(--border-main)]/30">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 min-w-20 flex-1 overflow-hidden rounded-full border border-[var(--border-main)]/60 bg-[var(--bg-app)]"
                        role="progressbar"
                        aria-label={`Progress ${t.title}`}
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ${
                            progress === 100
                              ? 'bg-[var(--accent-main)]'
                              : progress > 0
                                ? 'bg-[var(--accent-cyan)]'
                                : 'bg-[var(--border-main)]'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="w-9 text-right font-bold text-[var(--accent-cyan)]">{progress}%</span>
                    </div>
                  </td>
                  <td className="p-3 border-r border-[var(--border-main)]/30 text-[var(--text-muted)] whitespace-nowrap">
                    {t.dueDate || '-'}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(t.id);
                      }}
                      className="px-2 py-1 bg-[var(--bg-app)] border border-[var(--border-main)] hover:border-[var(--accent-cyan)] text-[var(--accent-cyan)] rounded text-[10px] font-bold"
                    >
                      Edit ✏️
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-[var(--text-muted)]">
                  No task records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
