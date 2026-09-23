'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTermFlowStore, TaskStatus, TaskPriority, Task, EnergyLevel } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { Trash2, Save, X, ArrowLeft, Play, Square, Send, Plus, Zap, Clock } from 'lucide-react';

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

export default function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const { tasks } = useTermFlowStore();

  const task = tasks.find((t) => t.id === taskId);
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
    lang,
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
      .map((s) => s.trim().replace(/^#/, ''))
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
      labels,
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
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/75 p-0 font-mono backdrop-blur-sm sm:items-center sm:p-4"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 0.8, 0.24, 1] }}
        className="terminal-modal flex h-full w-full max-w-2xl flex-col overflow-hidden bg-[var(--bg-surface)] text-[var(--text-main)] shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-xl sm:border sm:border-[var(--border-main)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar: Mobile has Back button (left), Desktop has Close X with circular hover bg (right) */}
        <div className="flex min-h-[48px] items-center justify-between border-b border-[var(--border-main)] bg-[var(--bg-app)] px-3 py-2 sm:px-4">
          {/* Mobile Back button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Kembali"
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-[var(--text-bright)] transition hover:bg-[var(--bg-muted)] sm:hidden"
          >
            <ArrowLeft size={18} strokeWidth={2} aria-hidden />
          </button>

          {/* Title / ID badge */}
          <div className="flex min-w-0 flex-1 items-center gap-2 px-1">
            <span className="font-mono text-xs font-bold text-[var(--accent-purple)]">[{task.id}]</span>
            <span className="truncate text-xs font-semibold text-[var(--text-bright)] sm:inline">{title || 'Task Detail'}</span>
          </div>

          {/* Desktop/Tablet Close button — min 40x40px, subtle circle hover bg, high contrast */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail task"
            title="Tutup (Esc)"
            className="hidden h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)] sm:inline-flex"
          >
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs">
          {/* Title Input */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Judul Task</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="terminal-input text-sm font-bold text-[var(--text-bright)]"
              placeholder="Judul task..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Deskripsi / Catatan</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="terminal-input resize-y text-xs leading-5"
              placeholder={getTranslation('task.descPlaceholder', lang)}
            />
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="terminal-input font-bold text-[var(--accent-cyan)]"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="terminal-input font-bold text-[var(--accent-yellow)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Assignee</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="terminal-input font-bold text-[var(--accent-purple)]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Energy</label>
              <select
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value as EnergyLevel)}
                className="terminal-input font-bold text-[var(--accent-purple)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  aria-label="Tanggal mulai"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="terminal-input text-xs"
                />
                <input
                  aria-label="Tanggal selesai"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="terminal-input text-xs"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="terminal-input text-xs"
              />
            </div>
          </div>

          {/* Labels / Tags Input */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Tags / Labels (koma)</label>
            <input
              type="text"
              value={labelsStr}
              onChange={(e) => setLabelsStr(e.target.value)}
              placeholder="frontend, bug, ui"
              className="terminal-input text-xs"
            />
          </div>

          {/* Subtasks Section */}
          <div className="space-y-2 rounded-lg border border-[var(--border-main)]/60 bg-[var(--bg-app)]/40 p-3">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--accent-main)]">
              <span>CHECKLIST / SUB-TASKS ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})</span>
            </div>

            <div className="space-y-1.5">
              {task.subtasks.map((st) => (
                <label key={st.id} className="flex min-h-[36px] cursor-pointer items-center gap-2 rounded bg-[var(--bg-app)] px-2.5 py-1.5 transition hover:bg-[var(--bg-muted)]">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => toggleSubtask(task.id, st.id)}
                    className="h-4 w-4 accent-[var(--accent-main)]"
                  />
                  <span className={`text-xs ${st.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)]'}`}>
                    {st.title}
                  </span>
                </label>
              ))}
            </div>

            <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="+ Tambah checklist item..."
                className="terminal-input flex-1 py-1 text-xs"
              />
              <button type="submit" className="terminal-button shrink-0">
                <Plus size={13} className="mr-1 inline" aria-hidden /> Tambah
              </button>
            </form>
          </div>

          {/* Focus mode quick action */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--accent-cyan)]/40 bg-[var(--accent-cyan)]/5 p-3">
            <div>
              <div className="font-bold text-[var(--accent-cyan)]">DEEP WORK / FOCUS</div>
              <div className="mt-1 text-[10px] text-[var(--text-muted)]">
                {isThisTaskFocusing ? `Sesi aktif · ${String(pomodoroMinutes).padStart(2, '0')}:${String(pomodoroSeconds).padStart(2, '0')}` : 'Mulai sesi 25 atau 50 menit untuk task ini.'}
              </div>
            </div>
            <div className="flex gap-2">
              {isThisTaskFocusing ? (
                <button type="button" onClick={stopFocus} className="terminal-button border-[var(--accent-red)]/60 text-[var(--accent-red)]">
                  <Square size={12} strokeWidth={1.75} className="mr-1 inline" aria-hidden /> Stop focus
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => startFocus(task.id, 25)} className="terminal-button terminal-button-primary">
                    <Play size={12} strokeWidth={1.75} className="mr-1 inline" aria-hidden /> 25m
                  </button>
                  <button type="button" onClick={() => startFocus(task.id, 50)} className="terminal-button">
                    <Play size={12} strokeWidth={1.75} className="mr-1 inline" aria-hidden /> 50m
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-2 rounded-lg border border-[var(--border-main)]/60 bg-[var(--bg-app)]/40 p-3">
            <h5 className="text-xs font-bold text-[var(--accent-purple)]">
              KOMENTAR &amp; LOG AKTIVITAS ({task.comments.length})
            </h5>

            <div className="max-h-36 space-y-2 overflow-y-auto">
              {task.comments.map((c) => (
                <div key={c.id} className="rounded border border-[var(--border-main)] bg-[var(--bg-surface)] p-2 text-xs">
                  <div className="mb-1 flex justify-between text-[10px] text-[var(--text-muted)]">
                    <span className="font-bold text-[var(--accent-purple)]">@{c.author}</span>
                    <span>{c.createdAt}</span>
                  </div>
                  <p className="text-[var(--text-main)]">{c.content}</p>
                </div>
              ))}

              {task.comments.length === 0 && (
                <div className="text-[11px] text-[var(--text-muted)]">Belum ada komentar.</div>
              )}
            </div>

            <form onSubmit={handleAddCommentSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar..."
                className="terminal-input flex-1 py-1 text-xs"
              />
              <button type="submit" className="terminal-button shrink-0 text-[var(--accent-purple)]">
                <Send size={13} className="mr-1 inline" aria-hidden /> Kirim
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex min-h-[56px] items-center justify-between border-t border-[var(--border-main)] bg-[var(--bg-app)] px-4 py-2.5">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[var(--accent-red)]/40 bg-[var(--accent-red)]/10 px-3 py-2 text-xs font-bold text-[var(--accent-red)] transition hover:bg-[var(--accent-red)] hover:text-white"
          >
            <Trash2 size={14} strokeWidth={1.75} aria-hidden />
            <span>Hapus Task</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[40px] items-center rounded-lg border border-[var(--border-main)] bg-[var(--bg-muted)] px-3 py-2 text-xs font-bold text-[var(--text-main)] transition hover:border-[var(--text-muted)]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[var(--accent-main)] bg-[var(--accent-main)] px-4 py-2 text-xs font-bold text-[var(--bg-app)] transition hover:bg-[var(--accent-hover)]"
            >
              <Save size={14} strokeWidth={1.75} aria-hidden />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
