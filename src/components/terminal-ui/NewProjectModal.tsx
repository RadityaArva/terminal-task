'use client';

import { FormEvent, useState } from 'react';
import { useTermFlowStore } from '@/lib/store';
import { Save, Plus, X } from 'lucide-react';

type Role = 'Owner' | 'Admin' | 'Member' | 'Viewer';
type AccessRow = { username: string; role: Role };

export default function NewProjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addProject = useTermFlowStore((state) => state.addProject);
  const profile = useTermFlowStore((state) => state.profile);
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [description, setDescription] = useState('');
  const [access, setAccess] = useState<AccessRow[]>([{ username: '', role: 'Member' }]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const members = access.filter((item) => item.username.trim());
    if (!name.trim()) return setError('Nama project wajib diisi.');
    const owner = { username: profile.username, role: 'Owner' as const };
    addProject({
      name: name.trim(),
      description: description.trim(),
      organizationName: organizationName.trim(),
      members: [owner, ...members.filter((item) => item.username.trim() !== profile.username)]
    });
    setName('');
    setOrganizationName('');
    setDescription('');
    setAccess([{ username: '', role: 'Member' }]);
    setError('');
    onClose();
  };

  return <div className="terminal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}><form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="terminal-modal max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 border-[var(--accent-cyan)] bg-[var(--bg-surface)] p-4 shadow-2xl"><div className="mb-4 flex items-center justify-between"><strong className="text-[var(--accent-cyan)]">&gt; new project --interactive</strong><button type="button" onClick={onClose} className="terminal-button">×</button></div><div className="grid gap-3"><input required value={name} onChange={(event) => { setName(event.target.value); setError(''); }} placeholder="Nama project *" className="terminal-input" /><input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Perusahaan / institusi pendidikan" className="terminal-input" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Deskripsi project" rows={2} className="terminal-input resize-y" /><div className="rounded border border-[var(--border-main)] p-3"><div className="mb-2 text-xs font-bold text-[var(--text-muted)]">ACCESS · creator @{profile.username} (Owner)</div>{access.map((row, index) => <div key={index} className="mb-2 flex gap-2"><input value={row.username} onChange={(event) => setAccess((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, username: event.target.value } : item))} placeholder="username / email" className="terminal-input min-w-0 flex-1 py-1.5" /><select value={row.role} onChange={(event) => setAccess((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value as Role } : item))} className="terminal-input w-auto py-1.5"><option>Admin</option><option>Member</option><option>Viewer</option></select><button type="button" onClick={() => setAccess((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="terminal-button px-2">×</button></div>)}<button type="button" onClick={() => setAccess((items) => [...items, { username: '', role: 'Member' }])} className="terminal-button">+ Add user</button></div></div>{error && <p role="alert" className="mt-3 rounded border border-[var(--accent-red)]/50 bg-[var(--accent-red)]/10 p-2 text-xs text-[var(--accent-red)]">{error}</p>}<div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="terminal-button">Cancel</button><button type="submit" className="terminal-button terminal-button-primary">Create &amp; open board</button></div></form></div>;
}
