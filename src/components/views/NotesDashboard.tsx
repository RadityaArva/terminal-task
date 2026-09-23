'use client';

import { useEffect, useMemo, useState } from 'react';
import { EbookSource, Note, useTermFlowStore } from '@/lib/store';
import { Search, X, Plus, BookOpen, FileText, Link2, File, Trash2, ExternalLink } from 'lucide-react';

type SortMode = 'updated' | 'title' | 'opened';
type PanelMode = 'split' | 'editor' | 'preview';
type Room = 'notes' | 'ebook';
type EbookFilter = 'all' | 'pdf' | 'link';

export default function NotesDashboard() {
  const { notes, ebooks, addNote, updateNote, deleteNote, openNote, addEbook, deleteEbook } = useTermFlowStore();
  const [room, setRoom] = useState<Room>('notes');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>('updated');
  const [query, setQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [folder, setFolder] = useState('');
  const [tag, setTag] = useState('');
  const [panel, setPanel] = useState<PanelMode>('split');
  const [reading, setReading] = useState(false);
  const [ebookFilter, setEbookFilter] = useState<EbookFilter>('all');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [showEbookModal, setShowEbookModal] = useState(false);

  const filteredNotes = useMemo(
    () =>
      notes
        .filter((n) => !query || `${n.title} ${n.content} ${n.folder || ''} ${n.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
        .filter((n) => !folder || n.folder === folder)
        .filter((n) => !tag || n.tags.includes(tag))
        .sort((a, b) =>
          sort === 'title'
            ? a.title.localeCompare(b.title)
            : new Date(sort === 'opened' ? b.lastOpenedAt || b.updatedAt : b.updatedAt).getTime() -
              new Date(sort === 'opened' ? a.lastOpenedAt || a.updatedAt : a.updatedAt).getTime()
        ),
    [folder, notes, query, sort, tag]
  );

  const filteredEbooks = useMemo(
    () =>
      ebooks
        .filter((e) => ebookFilter === 'all' || e.type === ebookFilter)
        .filter((e) => !query || `${e.title} ${e.description || ''} ${e.tags.join(' ')} ${e.url}`.toLowerCase().includes(query.toLowerCase())),
    [ebooks, ebookFilter, query]
  );

  const selected = notes.find((n) => n.id === selectedId) || filteredNotes[0];
  const folders = [...new Set(notes.map((n) => n.folder).filter(Boolean))] as string[];
  const tags = [...new Set(notes.flatMap((n) => n.tags))];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setReading((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const selectNote = (note: Note) => {
    setSelectedId(note.id);
    openNote(note.id);
  };

  return (
    <section className="space-y-4">
      {/* Room tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-main)]/50 pb-3">
        <button
          type="button"
          onClick={() => setRoom('notes')}
          className={`inline-flex min-h-[36px] items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${room === 'notes' ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]' : 'border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-bright)]'}`}
        >
          <FileText size={14} strokeWidth={1.75} aria-hidden /> Notes
          <span className="rounded-full bg-[var(--bg-muted)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">{notes.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setRoom('ebook')}
          className={`inline-flex min-h-[36px] items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${room === 'ebook' ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]' : 'border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-bright)]'}`}
        >
          <BookOpen size={14} strokeWidth={1.75} aria-hidden /> Ebook
          <span className="rounded-full bg-[var(--bg-muted)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">{ebooks.length}</span>
        </button>
        <span className="ml-1 hidden text-[11px] text-[var(--text-muted)] sm:inline">· {room === 'notes' ? 'Markdown notes' : 'PDF & Link sources'} · tekan <kbd className="rounded border border-[var(--border-main)] bg-[var(--bg-muted)] px-1 py-0.5 font-mono text-[10px] text-[var(--accent-cyan)]">r</kbd> reading mode (notes)</span>
      </div>

      {/* Header row: title + compact search + CTA (room-specific) */}
      <header className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-[var(--accent-main)] sm:text-lg">
            {room === 'notes' ? '> notes --dashboard' : '> ebook --sources'}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            {room === 'notes' ? 'Catatan Markdown di room ini.' : 'Kumpulan PDF, jurnal & link di room Ebook.'}
          </p>
        </div>

        {/* Compact / collapsible search */}
        <div className="flex items-center gap-2">
          {/* collapsed icon on mobile */}
          <button
            type="button"
            onClick={() => setSearchExpanded((v) => !v)}
            aria-label={searchExpanded ? 'Tutup pencarian' : 'Buka pencarian'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-bright)] sm:hidden"
          >
            {searchExpanded ? <X size={16} strokeWidth={1.75} /> : <Search size={16} strokeWidth={1.75} />}
          </button>

          <div className={`${searchExpanded ? 'flex' : 'hidden'} items-center gap-2 sm:flex`}>
            <div className="relative">
              <Search size={14} strokeWidth={1.75} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchExpanded(true)}
                placeholder={room === 'notes' ? 'Cari notes...' : 'Cari ebook / link...'}
                className="terminal-input w-[200px] py-2 pl-8 pr-8 text-xs sm:w-[260px]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)]"
                  aria-label="Hapus pencarian"
                >
                  <X size={12} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {room === 'notes' ? (
            <button type="button" onClick={() => setShowNewNoteModal(true)} className="terminal-button terminal-button-primary inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap">
              <Plus size={14} strokeWidth={2} aria-hidden /> New Note
            </button>
          ) : (
            <button type="button" onClick={() => setShowEbookModal(true)} className="terminal-button terminal-button-primary inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap">
              <Plus size={14} strokeWidth={2} aria-hidden /> Add Ebook/Source
            </button>
          )}
        </div>
      </header>

      {room === 'notes' ? (
        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="terminal-panel space-y-3 p-3">
            <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="terminal-input">
              <option value="updated">Terbaru diubah</option>
              <option value="title">Judul A-Z</option>
              <option value="opened">Terakhir dibuka</option>
            </select>
            <select value={folder} onChange={(e) => setFolder(e.target.value)} className="terminal-input">
              <option value="">Semua folder</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <select value={tag} onChange={(e) => setTag(e.target.value)} className="terminal-input">
              <option value="">Semua tag</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
              {filteredNotes.length === 0 ? (
                <div className="rounded border border-dashed border-[var(--border-main)] bg-[var(--bg-app)] p-4 text-center text-[11px] text-[var(--text-muted)]">Belum ada catatan sesuai filter.</div>
              ) : (
                filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => selectNote(note)}
                    className={`w-full rounded border p-2 text-left text-xs transition ${note.id === selected?.id ? 'border-[var(--accent-cyan)] bg-[var(--bg-muted)] text-[var(--accent-cyan)]' : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'}`}
                  >
                    <span className="block truncate font-bold">{note.title}</span>
                    <span className="mt-1 line-clamp-2 block whitespace-pre-wrap text-[10px] leading-4 text-[var(--text-muted)]">{note.content || 'Tanpa isi konten.'}</span>
                    <span className="mt-2 block text-[10px] text-[var(--text-muted)]">
                      {note.folder || 'uncategorized'} · {note.tags.join(', ') || 'no tags'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </aside>
          <NoteWorkspace
            key={selected?.id || 'empty'}
            note={selected}
            panel={panel}
            reading={reading}
            onPanelChange={setPanel}
            onReadingChange={setReading}
            onUpdate={updateNote}
            onDelete={(id) => {
              deleteNote(id);
              setSelectedId(null);
            }}
          />
        </div>
      ) : (
        <EbookRoom ebooks={filteredEbooks} filter={ebookFilter} onFilterChange={setEbookFilter} onDelete={deleteEbook} query={query} />
      )}

      {showNewNoteModal && (
        <NewNoteModal
          onClose={() => setShowNewNoteModal(false)}
          onSave={(data) => {
            const id = addNote(data);
            setSelectedId(id);
            setShowNewNoteModal(false);
            setRoom('notes');
          }}
        />
      )}
      {showEbookModal && (
        <AddEbookModal
          onClose={() => setShowEbookModal(false)}
          onSave={(data) => {
            addEbook(data);
            setShowEbookModal(false);
          }}
        />
      )}
    </section>
  );
}

function NewNoteModal({ onClose, onSave }: { onClose: () => void; onSave: (data: { title: string; content: string; folder?: string; tags: string[] }) => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folder, setFolder] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const canSave = title.trim().length > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="terminal-panel w-full max-w-lg p-4 sm:p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--accent-cyan)]">
            <FileText size={16} strokeWidth={1.75} aria-hidden /> New Note
          </h3>
          <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)]" aria-label="Tutup">
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul catatan *" className="terminal-input font-bold" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Isi Markdown..." rows={6} className="terminal-input resize-y font-mono text-sm leading-6" />
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="Folder (opsional)" className="terminal-input" />
            <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="tag1, tag2" className="terminal-input" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="terminal-button">
            Batal
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave({ title: title.trim(), content, folder: folder.trim() || undefined, tags: tagsStr.split(',').map((s) => s.trim()).filter(Boolean) })}
            className="terminal-button terminal-button-primary disabled:opacity-50"
          >
            <Plus size={14} className="mr-1 inline" aria-hidden /> Simpan ke Notes
          </button>
        </div>
      </div>
    </div>
  );
}

function AddEbookModal({ onClose, onSave }: { onClose: () => void; onSave: (data: Omit<EbookSource, 'id' | 'createdAt'>) => void }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'pdf' | 'link'>('pdf');
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [fileError, setFileError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Hanya PDF yang didukung.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setFileError('Ukuran PDF maksimal 10 MB (demo).');
      return;
    }
    setFileName(f.name);
    setType('pdf');
    // Create object URL for demo; persist as placeholder
    const objectUrl = URL.createObjectURL(f);
    setUrl(objectUrl);
    setFileError('');
  };

  const canSave = title.trim().length > 0 && url.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="terminal-panel w-full max-w-lg p-4 sm:p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--accent-cyan)]">
            <BookOpen size={16} strokeWidth={1.75} aria-hidden /> Add Ebook / Source
          </h3>
          <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-bright)]" aria-label="Tutup">
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul ebook / sumber *" className="terminal-input font-bold" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setType('pdf')} className={`flex-1 rounded border px-3 py-2 text-xs font-bold ${type === 'pdf' ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]' : 'border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-muted)]'}`}>
              <File size={13} className="mr-1 inline" aria-hidden /> PDF (upload)
            </button>
            <button type="button" onClick={() => setType('link')} className={`flex-1 rounded border px-3 py-2 text-xs font-bold ${type === 'link' ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]' : 'border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-muted)]'}`}>
              <Link2 size={13} className="mr-1 inline" aria-hidden /> Link URL
            </button>
          </div>

          {type === 'pdf' ? (
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-[var(--border-main)] bg-[var(--bg-app)] px-3 py-3 text-xs font-bold text-[var(--text-muted)] hover:border-[var(--accent-cyan)]/50 hover:text-[var(--accent-cyan)]">
                <File size={14} aria-hidden /> {fileName ? fileName : 'Pilih file PDF'}
                <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleFile} />
              </label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Atau tempel URL PDF / biarkan setelah upload" className="terminal-input text-xs" />
              {fileError && <p className="text-[11px] text-[var(--accent-red)]">{fileError}</p>}
              {fileName && <p className="text-[11px] text-[var(--text-muted)]">File: {fileName}</p>}
            </div>
          ) : (
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://... *" className="terminal-input" />
          )}

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi singkat (opsional)" rows={2} className="terminal-input resize-y text-xs" />
          <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="tag1, tag2" className="terminal-input" />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="terminal-button">
            Batal
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave({ title: title.trim(), type, url: url.trim(), fileName: fileName || undefined, description: description.trim() || undefined, tags: tagsStr.split(',').map((s) => s.trim()).filter(Boolean) })}
            className="terminal-button terminal-button-primary disabled:opacity-50"
          >
            <Plus size={14} className="mr-1 inline" aria-hidden /> Simpan ke Ebook
          </button>
        </div>
      </div>
    </div>
  );
}

function EbookRoom({ ebooks, filter, onFilterChange, onDelete, query }: { ebooks: EbookSource[]; filter: EbookFilter; onFilterChange: (f: EbookFilter) => void; onDelete: (id: string) => void; query: string }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'pdf', 'link'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onFilterChange(f)}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${filter === f ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]' : 'border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-muted)]'}`}
          >
            {f === 'all' ? 'Semua' : f.toUpperCase()} {f !== 'all' && `· ${ebooks.filter((e) => e.type === f).length}`}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-[var(--text-muted)]">
          {ebooks.length} item {query ? `· filter: "${query}"` : ''}
        </span>
      </div>

      {ebooks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border-main)] bg-[var(--bg-app)] p-8 text-center text-xs text-[var(--text-muted)]">
          Belum ada ebook/source {filter !== 'all' ? `(${filter})` : ''}. Klik <span className="font-bold text-[var(--accent-cyan)]">Add Ebook/Source</span> untuk menambah PDF atau Link.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ebooks.map((eb) => (
            <article key={eb.id} className="terminal-panel flex flex-col p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${eb.type === 'pdf' ? 'border-[var(--accent-purple)]/40 bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]' : 'border-[var(--accent-cyan)]/40 bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'}`}>
                  {eb.type === 'pdf' ? <File size={11} strokeWidth={1.75} aria-hidden /> : <Link2 size={11} strokeWidth={1.75} aria-hidden />}
                  {eb.type.toUpperCase()}
                </span>
                <span className="ml-auto text-[10px] text-[var(--text-muted)]">{new Date(eb.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
              <h4 className="line-clamp-2 text-sm font-bold leading-tight text-[var(--text-bright)]">{eb.title}</h4>
              {eb.fileName && <p className="mt-1 truncate text-[11px] text-[var(--text-muted)]">{eb.fileName}</p>}
              {eb.description && <p className="mt-2 line-clamp-3 text-xs leading-5 text-[var(--text-muted)]">{eb.description}</p>}
              {eb.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{eb.tags.map((t) => (<span key={t} className="rounded bg-[var(--bg-muted)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">#{t}</span>))}</div>}
              <div className="mt-3 flex items-center gap-2">
                <a href={eb.url} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-1 rounded border border-[var(--border-main)] bg-[var(--bg-app)] px-2 py-1.5 text-xs font-bold text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]/40">
                  <ExternalLink size={12} strokeWidth={1.75} aria-hidden /> Buka
                </a>
                <button type="button" onClick={() => onDelete(eb.id)} className="inline-flex h-8 w-8 items-center justify-center rounded border border-transparent text-[var(--text-muted)] hover:bg-[var(--accent-red)]/10 hover:text-[var(--accent-red)]" aria-label={`Hapus ${eb.title}`}>
                  <Trash2 size={14} strokeWidth={1.75} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteWorkspace({
  note,
  panel,
  reading,
  onPanelChange,
  onReadingChange,
  onUpdate,
  onDelete,
}: {
  note?: Note;
  panel: PanelMode;
  reading: boolean;
  onPanelChange: (mode: PanelMode) => void;
  onReadingChange: (reading: boolean) => void;
  onUpdate: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'folder'>>) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState(note);
  if (!draft) return <div className="terminal-panel flex min-h-80 items-center justify-center p-6 text-xs text-[var(--text-muted)]">Pilih catatan atau buat note baru.</div>;
  const save = (updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'folder'>>) => {
    setDraft({ ...draft, ...updates });
    onUpdate(draft.id, updates);
  };
  if (reading)
    return (
      <article className="terminal-panel mx-auto min-h-[520px] w-full max-w-[760px] p-4 sm:p-8 lg:p-10">
        <div className="mb-6 flex items-center justify-between border-b border-[var(--border-main)] pb-3 text-xs">
          <span className="text-[var(--accent-cyan)]">READER / {draft.title}</span>
          <button type="button" onClick={() => onReadingChange(false)} className="terminal-button">
            Edit
          </button>
        </div>
        <h2 className="mb-6 text-2xl font-bold text-[var(--text-bright)] sm:text-3xl">{draft.title}</h2>
        <div className="note-reader rounded-md border border-[var(--border-main)] bg-[var(--bg-app)] p-4 sm:p-6">
          <MarkdownPreview content={draft.content} large />
        </div>
      </article>
    );
  return (
    <div className="terminal-panel space-y-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={() => onPanelChange('split')} className="terminal-button">
            Split
          </button>
          <button type="button" onClick={() => onPanelChange('editor')} className="terminal-button">
            Editor
          </button>
          <button type="button" onClick={() => onPanelChange('preview')} className="terminal-button">
            Preview
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onReadingChange(true)} className="terminal-button">
            Reading mode
          </button>
          <button type="button" onClick={() => onDelete(draft.id)} className="terminal-button text-[var(--accent-red)]">
            Delete
          </button>
        </div>
      </div>
      <input value={draft.title} onChange={(e) => save({ title: e.target.value })} className="terminal-input text-base font-bold sm:text-lg" placeholder="Judul catatan" />
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={draft.folder || ''} onChange={(e) => save({ folder: e.target.value })} className="terminal-input" placeholder="Folder (opsional)" />
        <input value={draft.tags.join(', ')} onChange={(e) => save({ tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} className="terminal-input" placeholder="tag1, tag2" />
      </div>
      <div className={`grid gap-3 ${panel === 'split' ? 'md:grid-cols-2' : ''}`}>
        {panel !== 'preview' && <textarea value={draft.content} onChange={(e) => save({ content: e.target.value })} className="terminal-input min-h-[240px] resize-y font-mono text-sm leading-6 sm:min-h-[390px]" placeholder="Tulis Markdown..." />}
        {panel !== 'editor' && (
          <div className="min-h-[240px] overflow-auto rounded border border-[var(--border-main)] bg-[var(--bg-app)] p-3 sm:min-h-[390px] sm:p-4">
            <MarkdownPreview content={draft.content} />
          </div>
        )}
      </div>
      <div className="text-[10px] text-[var(--text-muted)]">
        Dibuat {new Date(draft.createdAt).toLocaleString()} · Diubah {new Date(draft.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}

function MarkdownPreview({ content, large = false }: { content: string; large?: boolean }) {
  return (
    <div className={large ? 'space-y-4 text-base leading-8 sm:text-lg' : 'space-y-2 text-sm leading-6'}>
      {content.split('\n').map((line, index) => {
        const value = line.trim();
        if (!value) return <div key={index} className="h-2" />;
        if (value.startsWith('# ')) return <h1 key={index} className="text-xl font-bold text-[var(--text-bright)] sm:text-2xl">{value.slice(2)}</h1>;
        if (value.startsWith('## ')) return <h2 key={index} className="text-lg font-bold text-[var(--accent-cyan)] sm:text-xl">{value.slice(3)}</h2>;
        if (value.startsWith('- ')) return <li key={index} className="ml-5 list-disc">{value.slice(2)}</li>;
        return <p key={index}>{value}</p>;
      })}
    </div>
  );
}
