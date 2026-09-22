'use client';

import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Task, TaskPriority, useTermFlowStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import RiskRadarBadge from './RiskRadarBadge';

interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

function TaskCard({ task, isSelected, onSelect, onDelete }: TaskCardProps) {
  const { lang } = useTermFlowStore();
  const shouldReduceMotion = useReducedMotion();

  const priorityColors: Record<TaskPriority, string> = {
    urgent: 'border-[var(--accent-red)] text-[var(--accent-red)] bg-[var(--accent-red)]/10',
    high: 'border-[var(--accent-yellow)] text-[var(--accent-yellow)] bg-[var(--accent-yellow)]/10',
    medium: 'border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10',
    low: 'border-[var(--text-muted)] text-[var(--text-muted)] bg-[var(--bg-muted)]',
  };

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <motion.div
      onClick={onSelect}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.22, 0.8, 0.24, 1] }}
      className={`relative cursor-pointer rounded-md border bg-[var(--bg-surface)] p-3 font-mono text-xs shadow-xs transition-colors duration-150 hover:border-[var(--accent-cyan)] ${
        isSelected
          ? 'border-2 border-[var(--accent-cyan)] shadow-md ring-1 ring-[var(--accent-cyan)]/30'
          : 'border-[var(--border-main)]'
      }`}
    >
      {/* Top row: ID, priority, and quick delete */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[var(--accent-purple)] font-bold">
          {task.id}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`px-1.5 py-0.5 rounded border text-[10px] uppercase font-bold ${priorityColors[task.priority]}`}>
            {getTranslation(`priority.${task.priority}`, lang)}
          </span>
          <span title={`Energy: ${task.energyLevel || 'medium'}`} className="rounded border border-[var(--accent-purple)]/50 px-1.5 py-0.5 text-[10px] text-[var(--accent-purple)]">
            {task.energyLevel === 'high' ? '⚡' : task.energyLevel === 'low' ? '▱' : '▰'} {task.energyLevel || 'medium'}
          </span>
          {onDelete && (
            <button
              type="button"
              aria-label={`Delete ${task.id}`}
              title="Delete task"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              className="rounded border border-transparent px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] transition hover:border-[var(--accent-red)]/60 hover:bg-[var(--accent-red)]/10 hover:text-[var(--accent-red)]"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="font-bold text-[var(--text-bright)] text-sm mb-1 line-clamp-2">
        {task.title}
      </h4>
      <RiskRadarBadge task={task} />

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
    </motion.div>
  );
}

export default memo(TaskCard);
