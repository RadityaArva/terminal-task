'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTermFlowStore, TaskStatus, TaskPriority, Task, EnergyLevel } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { Trash2, Save, X, Play, Square, Send, Plus, Zap } from 'lucide-react';

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

export default function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const { tasks } = useTermFlowStore();

  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  return <TaskDetailModalContent key={task.id} task={task} onClose={onClose} />;
}

function TaskDetailModalContent({ task, onClose }: { task: Task; onClose: () => void }) {
  const {
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    addComment,
    startFocus,
    stopFocus,
    isPomodoroRunning,
    focusTaskId,
    pomodoroMinutes,
    pomodoroSeconds,
    lang
  } = useTermFlowStore();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(task.energyLevel || 'medium');
  const [assignee, setAssignee] = useState(task.assignee);
  const [startDate, setStartDate] = useState(task.startDate || task.createdAt.slice(0, 10));
  const [endDate, setEndDate] = useState(task.endDate || task.dueDate);
  const [dueTime, setDueTime] = useState(task.dueTime || '');
  const [labelsStr, setLabelsStr] = useState(task.labels.join(', '));
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');

  const handleSave = () => {
    const labels = labelsStr
      .split(',')
      .map(s => s.trim().replace(/^#/, ''))
      .filter(Boolean);

    updateTask(task.id, {
      title,
      description,
      status,
      priority,
      energyLevel,
      assignee,
      startDate,
      endDate,
      dueDate: endDate,
      dueTime,
      labels
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Hapus task ${task.id}?`)) {
      deleteTask(task.id);
      onClose();
    }
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle);
      setNewSubtaskTitle('');
    }
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(task.id, newComment);
      setNewComment('');
    }
  };

  const isThisTaskFocusing = isPomodoroRunning && focusTaskId === task.id;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/70 p-0 font-mono backdrop-blur-xs sm:items-center sm:p-4"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 0.8, 0.24, 1] }}
        className="terminal-modal flex h-full w-full max-w-2xl flex-col overflow-hidden border-0 border-[var(--border-main)] bg-[var(--bg-surface)] text-[var(--text-main)] shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:border-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[var(--bg-app)] border-b border-[var(--border-main)] px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[var(--accent-purple)] font-bold">[{task.id}]</span>
            <span className="text-[var(--text-muted)]">Task Details & History</span>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-bright)]">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Title Input */}
          <div>
            <label className="block text-[var(--text-muted)] mb-1 text-[11px]">JUDUL TASK</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded px-3 py-1.5 text-sm font-bold text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent-cyan)]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[var(--text-muted)] mb-1 text-[11px]">DESKRIPSI / CATATAN</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded p-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-cyan)]"
              placeholder={getTranslation('task.descPlaceholder', lang)}
            />
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[var(--text-muted)] mb-1 text-[11px]">STATUS</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded p-1.5 font-bold text-[var(--accent-cyan)] focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-muted)] mb-1 text-[11px]">PRIORITAS</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded p-1.5 font-bold text-[var(--accent-yellow)] focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-muted)] mb-1 text-[11px]">ASSIGNEE</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded p-1.5 text-[var(--accent-purple)] font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[var(--text-muted)] mb-1 text-[11px]">ENERGY</label>
              <select value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value as EnergyLevel)} className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded p-1.5 text-[var(--accent-purple)] font-bold focus:outline-none">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-muted)] mb-1 text-[11px]">DATE RANGE</label>
              <div className="grid grid-cols-2 gap-2">
                <input aria-label="Tanggal mulai" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded p-1.5 text-[var(--text-main)] focus:outline-none" />
                <input aria-label="Tanggal selesai" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded p-1.5 text-[var(--text-main)] focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[var(--text-muted)] mb-1 text-[11px]">DUE TIME</label>
              <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded p-1.5 text-[var(--text-main)] focus:outline-none" />
            </div>
          </div>

          {/* Labels / Tags Input */}
          <div>
            <label className="block text-[var(--text-muted)] mb-1 text-[11px]">TAGS / LABELS (pisahkan dengan koma)</label>
            <input
              type="text"
              value={labelsStr}
              onChange={(e) => setLabelsStr(e.target.value)}
              placeholder="frontend, bug, ui"
              className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded p-1.5 text-xs text-[var(--text-main)] focus:outline-none"
            />
          </div>

          {/* Subtasks Section */}
          <div className="border border-[var(--border-main)]/60 rounded p-3 bg-[var(--bg-app)]/40 space-y-2">
            <h5 className="font-bold text-[var(--accent-main)] flex items-center justify-between text-xs">
              <span>CHECKLIST / SUB-TASKS ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})</span>
            </h5>

            <div className="space-y-1.5">
              {task.subtasks.map((st) => (
                <div key={st.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => toggleSubtask(task.id, st.id)}
                    className="accent-[var(--accent-main)] cursor-pointer"
                  />
                  <span className={`text-xs ${st.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                    {st.title}
                  </span>
                </div>

              ))}
            </div>

            <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="+ Tambah checklist item..."
                className="flex-1 bg-[var(--bg-app)] border border-[var(--border-main)] rounded px-2 py-1 text-xs focus:outline-none"
              />
              <button type="submit" className="bg-[var(--bg-muted)] border border-[var(--border-main)] px-3 py-1 rounded text-xs font-bold hover:bg-[var(--border-main)]">
                Tambah
              </button>
            </form>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-[var(--accent-cyan)]/40 bg-[var(--accent-cyan)]/5 p-3">
            <div>
              <div className="font-bold text-[var(--accent-cyan)]">DEEP WORK / FOCUS</div>
              <div className="mt-1 text-[10px] text-[var(--text-muted)]">{isThisTaskFocusing ? `Sesi aktif · ${String(pomodoroMinutes).padStart(2, '0')}:${String(pomodoroSeconds).padStart(2, '0')}` : 'Mulai sesi 25 atau 50 menit untuk task ini.'}</div>
            </div>
            <div className="flex gap-2">
              {isThisTaskFocusing ? <button type="button" onClick={stopFocus} className="terminal-button border-[var(--accent-red)]/60 text-[var(--accent-red)]"><Square size={12} strokeWidth={1.75} className="mr-1 inline" aria-hidden /> Stop focus</button> : <><button type="button" onClick={() => startFocus(task.id, 25)} className="terminal-button terminal-button-primary"><Play size={12} strokeWidth={1.75} className="mr-1 inline" aria-hidden /> 25m</button><button type="button" onClick={() => startFocus(task.id, 50)} className="terminal-button"><Play size={12} strokeWidth={1.75} className="mr-1 inline" aria-hidden /> 50m</button></>}
            </div>
          </div>

          {/* Comments Section */}
          <div className="border border-[var(--border-main)]/60 rounded p-3 bg-[var(--bg-app)]/40 space-y-2">
            <h5 className="font-bold text-[var(--accent-purple)] text-xs">
              KOMENTAR & LOG AKTIVITAS ({task.comments.length})
            </h5>

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {task.comments.map((c) => (
                <div key={c.id} className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded p-2 text-xs">
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1">
                    <span className="text-[var(--accent-purple)] font-bold">@{c.author}</span>
                    <span>{c.createdAt}</span>
                  </div>
                  <p className="text-[var(--text-main)]">{c.content}</p>
                </div>
              ))}

              {task.comments.length === 0 && (
                <div className="text-[var(--text-muted)] text-[11px]">Belum ada komentar.</div>
              )}
            </div>

            <form onSubmit={handleAddCommentSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar..."
                className="flex-1 bg-[var(--bg-app)] border border-[var(--border-main)] rounded px-2 py-1 text-xs focus:outline-none"
              />
              <button type="submit" className="bg-[var(--accent-purple)] text-[var(--bg-app)] px-3 py-1 rounded text-xs font-bold hover:opacity-90">
                Kirim
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[var(--bg-app)] border-t border-[var(--border-main)] px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 rounded bg-[var(--accent-red)]/10 text-[var(--accent-red)] border border-[var(--accent-red)]/40 hover:bg-[var(--accent-red)] hover:text-white text-xs font-bold transition-colors"
          >
            <Trash2 size={13} strokeWidth={1.75} className="mr-1.5 inline" aria-hidden /> Hapus Task
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[var(--bg-muted)] text-[var(--text-main)] border border-[var(--border-main)] hover:bg-[var(--border-main)] text-xs font-bold"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded bg-[var(--accent-main)] text-[var(--bg-app)] hover:bg-[var(--accent-hover)] font-bold text-xs transition-colors"
            >
              <Save size={13} strokeWidth={1.75} className="mr-1.5 inline" aria-hidden /> Simpan Perubahan
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
