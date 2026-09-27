'use client';

import { useRef } from 'react';
import { X, Plus } from 'lucide-react';
import Checkbox from './Checkbox';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

interface Props {
  value: ChecklistItem[];
  onChange: (v: ChecklistItem[]) => void;
  placeholder?: string;
}

export default function ChecklistBuilder({ value, onChange, placeholder }: Props) {
  const nextId = useRef(0);

  const addItem = () => {
    const item: ChecklistItem = { id: `chk-${Date.now()}-${nextId.current++}`, title: '', completed: false };
    onChange([...value, item]);
  };

  const updateItem = (id: string, patch: Partial<ChecklistItem>) => {
    onChange(value.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    onChange(value.filter((it) => it.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (idx === value.length - 1) addItem();
    }
  };

  return (
    <div className="space-y-2">
      {value.length === 0 && <p className="text-[11px] text-[var(--text-muted)]">Belum ada item. Klik "Tambah item" untuk mulai.</p>}
      {value.map((item, idx) => (
        <div key={item.id} className="flex items-center gap-2 rounded border border-[var(--border-main)]/40 bg-[var(--bg-app)] px-2 py-1.5">
          <Checkbox checked={item.completed} onChange={() => updateItem(item.id, { completed: !item.completed })} />
          <input
            value={item.title}
            onChange={(e) => updateItem(item.id, { title: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            placeholder={placeholder || `Item ${idx + 1}`}
            className="flex-1 bg-transparent text-xs text-[var(--text-bright)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--accent-red)]/10 hover:text-[var(--accent-red)]"
            aria-label="Hapus item"
          >
            <X size={12} strokeWidth={1.75} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1 rounded border border-dashed border-[var(--border-main)] bg-transparent px-2.5 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]"
      >
        <Plus size={12} strokeWidth={1.75} /> Tambah item
      </button>
    </div>
  );
}
