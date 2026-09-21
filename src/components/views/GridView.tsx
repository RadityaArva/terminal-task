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
    return (
      t.title.toLowerCase().includes(q) ||
      t.labels.some((l) => l.toLowerCase().includes(q)) ||
      t.assignee.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg font-mono text-xs shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-app)] border-b border-[var(--border-main)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider">
              <th className="p-3 border-r border-[var(--border-main)]/50">ID</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Title</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Status</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Priority</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Assignee</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Checklist</th>
              <th className="p-3 border-r border-[var(--border-main)]/50">Due Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-main)]/40">
            {filteredTasks.map((t) => {
              const isSelected = t.id === selectedTaskId;
              const completedCount = t.subtasks.filter(s => s.completed).length;

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
                <td colSpan={8} className="p-8 text-center text-[var(--text-muted)]">
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

