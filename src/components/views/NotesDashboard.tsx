'use client';

import { useEffect, useMemo, useState } from 'react';
import { Note, useTermFlowStore } from '@/lib/store';

type SortMode = 'updated' | 'title' | 'opened';
type PanelMode = 'split' | 'editor' | 'preview';

export default function NotesDashboard() {
  const { notes, addNote, updateNote, deleteNote, openNote } = useTermFlowStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>('updated');
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState('');
  const [tag, setTag] = useState('');
  const [panel, setPanel] = useState<PanelMode>('split');
  const [reading, setReading] = useState(false);

  const filteredNotes = useMemo(() => notes
    .filter((note) => (!query || `${note.title} ${note.content}`.toLowerCase().includes(query.toLowerCase())))
    .filter((note) => (!folder || note.folder === folder))
    .filter((note) => (!tag || note.tags.includes(tag)))
    .sort((a, b) => sort === 'title'
      ? a.title.localeCompare(b.title)
      : new Date(sort === 'opened' ? (b.lastOpenedAt || b.updatedAt) : b.updatedAt).getTime() - new Date(sort === 'opened' ? (a.lastOpenedAt || a.updatedAt) : a.updatedAt).getTime()), [folder, notes, query, sort, tag]);
  const selected = notes.find((note) => note.id === selectedId) || filteredNotes[0];
  const folders = [...new Set(notes.map((note) => note.folder).filter(Boolean))] as string[];
  const tags = [...new Set(notes.flatMap((note) => note.tags))];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'r' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) {
        event.preventDefault();
        setReading((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const createNote = () => {
    const id = addNote({ title: 'Untitled note' });
    setSelectedId(id);
    setReading(false);
  };
  const selectNote = (note: Note) => {
    setSelectedId(note.id);
    openNote(note.id);
  };

  return <section className="space-y-4">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-lg font-bold text-[var(--accent-main)]">&gt; notes --dashboard</h1><p className="text-xs text-[var(--text-muted)]">Markdown notes · shortcut <kbd className="text-[var(--accent-cyan)]">r</kbd> untuk reading mode.</p></div>
      <button type="button" onClick={createNote} className="terminal-button terminal-button-primary">+ New note</button>
    </header>
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="terminal-panel space-y-3 p-3">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes..." className="terminal-input" />
        <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className="terminal-input"><option value="updated">Terbaru diubah</option><option value="title">Judul A-Z</option><option value="opened">Terakhir dibuka</option></select>
        <select value={folder} onChange={(event) => setFolder(event.target.value)} className="terminal-input"><option value="">Semua folder</option>{folders.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={tag} onChange={(event) => setTag(event.target.value)} className="terminal-input"><option value="">Semua tag</option>{tags.map((item) => <option key={item}>{item}</option>)}</select>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {filteredNotes.length === 0 ? (
            <div className="rounded border border-dashed border-[var(--border-main)] bg-[var(--bg-app)] p-4 text-center text-[11px] text-[var(--text-muted)]">
              Belum ada catatan sesuai filter.
            </div>
          ) : filteredNotes.map((note) => (
            <button key={note.id} type="button" onClick={() => selectNote(note)} className={`w-full rounded border p-2 text-left text-xs transition ${note.id === selected?.id ? 'border-[var(--accent-cyan)] bg-[var(--bg-muted)] text-[var(--accent-cyan)]' : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'}`}>
              <span className="block truncate font-bold">{note.title}</span>
              <span className="mt-1 line-clamp-2 block whitespace-pre-wrap text-[10px] leading-4 text-[var(--text-muted)]">{note.content || 'Tanpa isi konten.'}</span>
              <span className="mt-2 block text-[10px] text-[var(--text-muted)]">{note.folder || 'uncategorized'} · {note.tags.join(', ') || 'no tags'}</span>
            </button>
          ))}
        </div>
      </aside>
      <NoteWorkspace key={selected?.id || 'empty'} note={selected} panel={panel} reading={reading} onPanelChange={setPanel} onReadingChange={setReading} onUpdate={updateNote} onDelete={(id) => { deleteNote(id); setSelectedId(null); }} />
    </div>
  </section>;
}

function NoteWorkspace({ note, panel, reading, onPanelChange, onReadingChange, onUpdate, onDelete }: { note?: Note; panel: PanelMode; reading: boolean; onPanelChange: (mode: PanelMode) => void; onReadingChange: (reading: boolean) => void; onUpdate: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'folder'>>) => void; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState(note);
  if (!draft) return <div className="terminal-panel flex min-h-80 items-center justify-center p-6 text-xs text-[var(--text-muted)]">Pilih catatan atau buat note baru.</div>;
  const save = (updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'folder'>>) => { setDraft({ ...draft, ...updates }); onUpdate(draft.id, updates); };
  if (reading) return <article className="terminal-panel mx-auto min-h-[520px] w-full max-w-[760px] p-4 sm:p-8 lg:p-10"><div className="mb-6 flex items-center justify-between border-b border-[var(--border-main)] pb-3 text-xs"><span className="text-[var(--accent-cyan)]">READER / {draft.title}</span><button type="button" onClick={() => onReadingChange(false)} className="terminal-button">Edit</button></div><h2 className="mb-6 text-2xl font-bold text-[var(--text-bright)] sm:text-3xl">{draft.title}</h2><div className="note-reader rounded-md border border-[var(--border-main)] bg-[var(--bg-app)] p-4 sm:p-6"><MarkdownPreview content={draft.content} large /></div></article>;
  return (
    <div className="terminal-panel space-y-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={() => onPanelChange('split')} className="terminal-button">Split</button>
          <button type="button" onClick={() => onPanelChange('editor')} className="terminal-button">Editor</button>
          <button type="button" onClick={() => onPanelChange('preview')} className="terminal-button">Preview</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onReadingChange(true)} className="terminal-button">Reading mode</button>
          <button type="button" onClick={() => onDelete(draft.id)} className="terminal-button text-[var(--accent-red)]">Delete</button>
        </div>
      </div>
      <input value={draft.title} onChange={(event) => save({ title: event.target.value })} className="terminal-input text-base font-bold sm:text-lg" placeholder="Judul catatan" />
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={draft.folder || ''} onChange={(event) => save({ folder: event.target.value })} className="terminal-input" placeholder="Folder (opsional)" />
        <input value={draft.tags.join(', ')} onChange={(event) => save({ tags: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} className="terminal-input" placeholder="tag1, tag2" />
      </div>
      <div className={`grid gap-3 ${panel === 'split' ? 'md:grid-cols-2' : ''}`}>
        {panel !== 'preview' && (
          <textarea value={draft.content} onChange={(event) => save({ content: event.target.value })} className="min-h-[240px] terminal-input resize-y font-mono text-sm leading-6 sm:min-h-[390px]" placeholder="Tulis Markdown..." />
        )}
        {panel !== 'editor' && (
          <div className="min-h-[240px] overflow-auto rounded border border-[var(--border-main)] bg-[var(--bg-app)] p-3 sm:min-h-[390px] sm:p-4">
            <MarkdownPreview content={draft.content} />
          </div>
        )}
      </div>
      <div className="text-[10px] text-[var(--text-muted)]">Dibuat {new Date(draft.createdAt).toLocaleString()} · Diubah {new Date(draft.updatedAt).toLocaleString()}</div>
    </div>
  );
}

function MarkdownPreview({ content, large = false }: { content: string; large?: boolean }) {
  return <div className={large ? 'space-y-4 text-base leading-8 sm:text-lg' : 'space-y-2 text-sm leading-6'}>{content.split('\n').map((line, index) => { const value = line.trim(); if (!value) return <div key={index} className="h-2" />; if (value.startsWith('# ')) return <h1 key={index} className="text-xl font-bold text-[var(--text-bright)] sm:text-2xl">{value.slice(2)}</h1>; if (value.startsWith('## ')) return <h2 key={index} className="text-lg font-bold text-[var(--accent-cyan)] sm:text-xl">{value.slice(3)}</h2>; if (value.startsWith('- ')) return <li key={index} className="ml-5 list-disc">{value.slice(2)}</li>; return <p key={index}>{value}</p>; })}</div>;
}
