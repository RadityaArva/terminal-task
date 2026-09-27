'use client';

import { useState } from 'react';
import { useTermFlowStore, Board } from '@/lib/store';
import { Plus, LayoutGrid, Clock, Trash2, Pencil, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function BoardCard({ board, onSelect, onDelete, taskCount }: { board: Board; onSelect: () => void; onDelete: () => void; taskCount: number }) {
  return (
    <div
      onClick={onSelect}
      className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-4 text-left transition hover:border-[var(--accent-cyan)] hover:shadow-lg sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-lg"
          style={{ background: `${board.color}18`, borderColor: `${board.color}40`, color: board.color }}
        >
          <span aria-hidden>{board.icon || '📋'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[var(--border-main)] bg-[var(--bg-app)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
            {taskCount} tasks
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--accent-red)]/20 bg-[var(--accent-red)]/10 text-[var(--accent-red)] opacity-70 transition hover:border-[var(--accent-red)]/40 hover:bg-[var(--accent-red)] hover:text-white hover:opacity-100 group-hover:opacity-100"
            aria-label={`Hapus board ${board.name}`}
            title="Hapus board"
          >
            <Trash2 size={13} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold text-[var(--text-bright)] group-hover:text-[var(--accent-cyan)]">{board.name}</h3>
        {board.description && <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">{board.description}</p>}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-[10px] text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-1">
          <Clock size={11} /> {new Date(board.lastOpenedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
        </span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: board.color }} aria-hidden />
      </div>
    </div>
  );
}

function NewBoardModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (d: { name: string; icon: string; color: string; description: string }) => void }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📋');
  const [color, setColor] = useState('#50fa7b');
  const [desc, setDesc] = useState('');

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] shadow-2xl">
        <div className="shrink-0 border-b border-[var(--border-main)] bg-[var(--bg-app)] px-5 py-4">
          <h3 className="text-sm font-bold text-[var(--text-bright)]">Buat Board Baru</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Pisahkan workspace: Pekerjaan, Kuliah, Personal, dll.</p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Nama board *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Side Project" className="terminal-input text-sm" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Ikon (emoji)</label>
              <input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} className="terminal-input text-center text-lg" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Warna</label>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-9 rounded border border-[var(--border-main)] bg-transparent p-1" />
                <span className="text-xs text-[var(--text-muted)]">{color}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Deskripsi (opsional)</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Kegunaan board ini..." className="terminal-input resize-none text-sm" />
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--border-main)] bg-[var(--bg-app)] px-5 py-3">
          <button type="button" onClick={onClose} className="rounded border border-[var(--border-main)] bg-[var(--bg-app)] px-4 py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-bright)]">Batal</button>
          <button
            type="button"
            onClick={() => {
              if (!name.trim()) return;
              onCreate({ name: name.trim(), icon: icon.trim() || '📋', color, description: desc.trim() });
              setName(''); setIcon('📋'); setColor('#50fa7b'); setDesc(''); onClose();
            }}
            className="rounded bg-[var(--accent-main)] px-4 py-2 text-xs font-bold text-[var(--bg-app)] hover:opacity-90"
          >
            Buat Board
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BoardSelectorView() {
  const { boards, tasks, addBoard, deleteBoard, setActiveBoardId } = useTermFlowStore();
  const [query, setQuery] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);

  const filtered = boards.filter((b) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return b.name.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-black tracking-tight text-[var(--text-bright)] sm:text-xl">
            <LayoutGrid size={18} className="text-[var(--accent-cyan)]" /> Pilih Board
          </h1>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">
            Setiap board punya task, notes, ebook, dan project yang terpisah sepenuhnya. Pilih board untuk mulai bekerja.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari board..." className="terminal-input h-10 w-full rounded-lg py-2.5 pl-10 pr-3 text-xs sm:text-sm" />
          </div>
          <button type="button" onClick={() => setIsNewOpen(true)} className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--accent-main)] px-4 py-2 text-xs font-bold text-[var(--bg-app)] hover:opacity-95">
            <Plus size={14} /> Buat Board
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-main)] bg-[var(--bg-surface)]/50 px-6 py-16 sm:py-20 text-center">
          <div className="text-3xl">📋</div>
          <p className="mt-3 text-sm font-bold text-[var(--text-bright)]">Belum ada board yang cocok</p>
          <p className="mt-1 max-w-sm text-xs text-[var(--text-muted)]">Coba kata kunci lain atau buat board baru untuk memulai workspace terpisah.</p>
          <button type="button" onClick={() => setIsNewOpen(true)} className="mt-4 rounded-lg border border-[var(--accent-cyan)] bg-[var(--bg-app)] px-4 py-2 text-xs font-bold text-[var(--accent-cyan)]">+ Buat Board Baru</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((board) => {
            const count = tasks.filter((t) => t.boardId === board.id).length;
            return <BoardCard key={board.id} board={board} taskCount={count} onSelect={() => setActiveBoardId(board.id)} onDelete={() => { if (confirm(`Hapus board "${board.name}"? Data board ini (task/notes/ebook) akan ikut terhapus.`)) deleteBoard(board.id); }} />;
          })}
          <button
            type="button"
            onClick={() => setIsNewOpen(true)}
            className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border-main)] bg-[var(--bg-surface)]/30 p-6 text-center transition hover:border-[var(--accent-cyan)] hover:bg-[var(--bg-surface)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]">
              <Plus size={18} />
            </span>
            <span className="text-sm font-bold text-[var(--text-bright)]">Buat Board Baru</span>
            <span className="text-xs text-[var(--text-muted)]">Workspace terpisah</span>
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-[10px] text-[var(--text-muted)]">
        Tip: pakai Command Palette <kbd className="rounded border border-[var(--border-main)] px-1">Ctrl+K</kbd> → <code>open board [nama]</code> / <code>new board</code> / <code>switch board [nama]</code>
      </p>

      <NewBoardModal open={isNewOpen} onClose={() => setIsNewOpen(false)} onCreate={(d) => addBoard(d)} />
    </div>
  );
}
