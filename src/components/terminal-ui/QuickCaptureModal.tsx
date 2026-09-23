'use client';

import { FormEvent, useState } from 'react';
import { useTermFlowStore } from '@/lib/store';
import { Zap, X, Save } from 'lucide-react';

export default function QuickCaptureModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addTask = useTermFlowStore((state) => state.addTask);
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    addTask({ title: title.trim(), projectId: 'inbox' });
    setTitle('');
    onClose();
  };

  return (
    <div className="terminal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="terminal-modal w-full max-w-lg rounded-lg border-2 border-[var(--accent-cyan)] bg-[var(--bg-surface)] p-4 shadow-2xl">
        <div className="mb-3 font-bold text-[var(--accent-cyan)]">&gt; capture --inbox</div>
        <p className="mb-3 text-xs text-[var(--text-muted)]">Tulis task cepat. Detail proyek, label, dan deadline bisa diatur dari Inbox.</p>
        <input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Apa yang perlu dikerjakan?" className="terminal-input" />
        <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={onClose} className="terminal-button">Batal</button><button type="submit" className="terminal-button terminal-button-primary"><Save size={14} className="mr-1.5 inline" aria-hidden /> Simpan ke Inbox ↵</button></div>
      </form>
    </div>
  );
}
