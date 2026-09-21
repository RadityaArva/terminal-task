'use client';

import { Task, TaskPriority, useTermFlowStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';

interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function TaskCard({ task, isSelected, onSelect }: TaskCardProps) {
  const { lang } = useTermFlowStore();

  const priorityColors: Record<TaskPriority, string> = {
    urgent: 'border-[var(--accent-red)] text-[var(--accent-red)] bg-[var(--accent-red)]/10',
    high: 'border-[var(--accent-yellow)] text-[var(--accent-yellow)] bg-[var(--accent-yellow)]/10',
    medium: 'border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10',
    low: 'border-[var(--text-muted)] text-[var(--text-muted)] bg-[var(--bg-muted)]',
  };

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-md border bg-[var(--bg-surface)] font-mono text-xs transition-all cursor-pointer shadow-xs hover:border-[var(--accent-cyan)] ${
        isSelected
          ? 'border-2 border-[var(--accent-cyan)] shadow-md ring-1 ring-[var(--accent-cyan)]/30'
          : 'border-[var(--border-main)]'
      }`}
    >
      {/* Top row: ID & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[var(--accent-purple)] font-bold">
          {task.id}
        </span>
        <span className={`px-1.5 py-0.5 rounded border text-[10px] uppercase font-bold ${priorityColors[task.priority]}`}>
          {getTranslation(`priority.${task.priority}`, lang)}
        </span>
      </div>

      {/* Task Title */}
      <h4 className="font-bold text-[var(--text-bright)] text-sm mb-1 line-clamp-2">
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-[var(--text-muted)] text-[11px] line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      {/* Labels / Tags */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((label, idx) => (
            <span
              key={idx}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-app)] border border-[var(--border-main)] text-[var(--text-muted)]"
            >
              #{label}
            </span>
          ))}
        </div>
      )}

      {/* Progress & Due Date & Assignee */}
      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-main)]/40 mt-2">
        <div className="flex items-center space-x-2">
          {totalSubtasks > 0 && (
            <span className={`font-bold ${completedSubtasks === totalSubtasks ? 'text-[var(--accent-main)]' : ''}`}>
              [{completedSubtasks}/{totalSubtasks}]
            </span>
          )}
          {task.dueDate && (
            <span>📅 {task.dueDate}</span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {task.githubPr && (
            <span className="text-[var(--accent-cyan)]" title={`PR #${task.githubPr.number}`}>
              🔗 #{task.githubPr.number}
            </span>
          )}
          <span className="text-[var(--accent-purple)] font-bold">
            @{task.assignee}
          </span>
        </div>
      </div>
    </div>
  );
}
