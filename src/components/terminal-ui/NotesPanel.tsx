'use client';

import { useState } from 'react';
import { useTermFlowStore } from '@/lib/store';

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotesPanel({ isOpen, onClose }: NotesPanelProps) {
  const { activeProjectId, projectNotes, saveProjectNote, deleteProjectNote } = useTermFlowStore();
  const notes = Array.isArray(projectNotes[activeProjectId]) ? projectNotes[activeProjectId] : [];
  const [selectedId, setSelectedId] = useState<string | undefined>(notes[0]?.id);
  const selected = notes.find((note) => note.id === selectedId);
  const [mode, setMode] = useState<'edit' | 'read'>('edit');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6" onClick={onClose}>
      <section className="flex h-[min(760px,92vh)] w-full max-w-5xl overflow-hidden rounded-lg border-2 border-[var(--border-main)] bg-[var(--bg-surface)] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <aside className="hidden w-56 shrink-0 border-r border-[var(--border-main)] bg-[var(--bg-app)] p-3 sm:block">
          <div className="mb-3 flex items-center justify-between text-xs font-bold text-[var(--accent-yellow)]"><span>notes/</span><button onClick={() => setSelectedId(undefined)} className="text-lg">+</button></div>
          <div className="space-y-1">
            {notes.map((note) => <button key={note.id} onClick={() => setSelectedId(note.id)} className={`w-full truncate rounded px-2 py-2 text-left text-xs ${note.id === selectedId ? 'bg-[var(--bg-muted)] text-[var(--accent-cyan)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'}`}>{note.name}</button>)}
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[var(--border-main)] bg-[var(--bg-app)] px-4 py-3 text-xs">
            <span className="font-bold text-[var(--accent-cyan)]">&gt; notes --workspace</span>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-bright)]">✕</button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="flex gap-2 sm:hidden">
              <select value={selectedId || ''} onChange={(event) => setSelectedId(event.target.value || undefined)} className="terminal-input">
                <option value="">New note</option>
                {notes.map((note) => <option key={note.id} value={note.id}>{note.name}</option>)}
              </select>
            </div>
            {mode === 'read' && selected ? <NoteReader note={selected} onEdit={() => setMode('edit')} /> : <NoteEditor
            key={selectedId || 'new'}
            initialName={selected?.name || ''}
            initialContent={selected?.content || ''}
            onSave={(name, content) => {
              const noteId = selectedId || `note-${Date.now()}`;
              saveProjectNote(activeProjectId, { id: noteId, name, content });
              setSelectedId(noteId);
            }}
            />}
          </div>
          <footer className="flex justify-between border-t border-[var(--border-main)] bg-[var(--bg-app)] px-4 py-3">
            <button disabled={!selectedId} onClick={() => { if (selectedId) { deleteProjectNote(activeProjectId, selectedId); setSelectedId(undefined); } }} className="terminal-button text-[var(--accent-red)] disabled:opacity-30">Hapus</button>
            <button onClick={() => setMode(mode === 'edit' ? 'read' : 'edit')} disabled={!selected} className="terminal-button disabled:opacity-30">{mode === 'edit' ? 'Baca seperti PDF' : 'Kembali edit'}</button>
          </footer>
        </div>
      </section>
    </div>
  );
}

function NoteReader({ note, onEdit }: { note: { name: string; content: string }; onEdit: () => void }) {
  const blocks = note.content.split('\n');
  return <div className="note-reader flex min-h-full flex-col items-center gap-4 py-2"><div className="flex w-full max-w-3xl items-center justify-between text-xs text-[var(--text-muted)]"><span>DOCUMENT / {note.name}</span><button onClick={onEdit} className="terminal-button">Edit</button></div><article className="note-page w-full max-w-3xl rounded-sm p-7 text-[var(--text-main)] shadow-xl sm:p-12"><h1 className="mb-8 border-b border-slate-200 pb-4 text-2xl font-bold text-slate-900">{note.name}</h1>{blocks.map((line, index) => { const trimmed = line.trim(); if (!trimmed) return <div key={index} className="h-4" />; if (trimmed.startsWith('**') && trimmed.endsWith('**')) return <p key={index} className="font-bold text-slate-900">{trimmed.slice(2, -2)}</p>; if (trimmed.startsWith('- ')) return <li key={index} className="ml-5 list-disc text-slate-700">{trimmed.slice(2)}</li>; if (/^\d+\.\s/.test(trimmed)) return <li key={index} className="ml-5 list-decimal text-slate-700">{trimmed.replace(/^\d+\.\s/, '')}</li>; return <p key={index} className="leading-7 text-slate-700">{trimmed}</p>; })}</article><span className="text-[10px] text-[var(--text-muted)]">Page 1 · TermFlow Reader</span></div>;
}

function NoteEditor({ initialName, initialContent, onSave }: { initialName: string; initialContent: string; onSave: (name: string, content: string) => void }) {
  const [name, setName] = useState(initialName);
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(false);
  const insert = (prefix: string, suffix = '') => {
    setContent((value) => `${value}${value && !value.endsWith('\n') ? '\n' : ''}${prefix}Tulis di sini${suffix}`);
    setSaved(false);
  };
  return (
    <>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama note, misalnya Sprint Plan" className="terminal-input font-bold" />
      <div className="flex flex-wrap gap-2 rounded border border-[var(--border-main)] bg-[var(--bg-muted)] p-2">
        <button type="button" onClick={() => insert('**', '**')} className="terminal-button font-bold">B</button>
        <button type="button" onClick={() => insert('- ')} className="terminal-button">• Point</button>
        <button type="button" onClick={() => insert('1. ')} className="terminal-button">1. Nomor</button>
        <span className="self-center text-[10px] text-[var(--text-muted)]">Format terminal: Markdown</span>
      </div>
      <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Tulis catatan project di sini..." className="min-h-[320px] w-full resize-y rounded border border-[var(--border-main)] bg-[var(--bg-app)] p-4 font-mono text-sm leading-6 text-[var(--text-main)] outline-none focus:border-[var(--accent-cyan)]" />
      <div className="flex items-center justify-between"><span className="text-[10px] text-[var(--text-muted)]">{saved ? '✓ Saved to profile notes' : 'Belum disimpan'}</span><button onClick={() => { onSave(name, content); setSaved(true); }} className="terminal-button terminal-button-primary">Simpan perubahan</button></div>
    </>
  );
}
