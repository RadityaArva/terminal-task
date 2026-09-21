'use client';

import { FormEvent, useState } from 'react';
import { useTermFlowStore, UserProfile } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';

export default function ProfileView() {
  const store = useTermFlowStore();
  const { profile, activityLogs, tasks, lang, projectNotes } = store;
  const [modal, setModal] = useState<'profile' | 'settings' | null>(null);
  const completedTasks = tasks.filter((task) => task.status === 'done');
  const completedDates = new Set(completedTasks.map((task) => (task.completedAt || task.createdAt).slice(0, 10)));
  const today = new Date();
  const dateKey = (date: Date) => date.toISOString().slice(0, 10);
  let streak = 0;
  const cursor = new Date(today);
  if (!completedDates.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (completedDates.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  const heatmapDays = Array.from({ length: 140 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (139 - index));
    return Math.min(3, completedTasks.filter((task) => (task.completedAt || task.createdAt).slice(0, 10) === dateKey(date)).length);
  });
  const notes = Object.values(projectNotes).flat();

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-mono">
      <section className="terminal-panel flex flex-wrap items-center gap-5 p-5 sm:p-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--accent-cyan)] bg-[var(--accent-purple)] text-3xl font-bold text-[var(--bg-app)]">
          {profile.avatarUrl ? <div role="img" aria-label={profile.name} className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${profile.avatarUrl}")` }} /> : profile.name.charAt(0)}
        </div>
        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold text-[var(--text-bright)]">{profile.name}</h2><span className="rounded border border-[var(--accent-cyan)]/40 px-2 py-0.5 text-xs text-[var(--accent-cyan)]">@{profile.username}</span></div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{profile.role}</p>
          <p className="mt-2 text-xs italic text-[var(--text-main)]">&quot;{profile.bio}&quot;</p>
        </div>
        <div className="flex gap-2"><button onClick={() => setModal('profile')} className="terminal-button">Edit profile</button><button onClick={() => setModal('settings')} className="terminal-button">⚙ Settings</button></div>
        <div className="grid w-full grid-cols-3 gap-2 text-center sm:w-auto">
          <Stat value={completedTasks.length} label={getTranslation('profile.completedTasks', lang)} color="main" />
          <Stat value={`🔥 ${streak}d`} label={getTranslation('profile.dailyStreak', lang)} color="yellow" />
          <Stat value={tasks.length} label={getTranslation('profile.totalTasks', lang)} color="purple" />
        </div>
      </section>

      <section className="terminal-panel space-y-3 p-5">
        <h3 className="flex justify-between text-xs font-bold text-[var(--accent-cyan)]"><span>📊 {getTranslation('profile.contributionHeatmap', lang)}</span><span className="text-[10px] text-[var(--text-muted)]">Less ■ ■ ■ ■ More</span></h3>
        <div className="overflow-x-auto pb-2"><div className="grid w-max grid-flow-col grid-rows-7 gap-1.5">{heatmapDays.map((level, index) => <div key={index} className={`h-3.5 w-3.5 rounded-xs ${level === 3 ? 'bg-[var(--accent-main)]' : level === 2 ? 'bg-[var(--accent-main)]/70' : level === 1 ? 'bg-[var(--accent-main)]/30' : 'border border-[var(--border-main)]/30 bg-[var(--bg-app)]'}`} />)}</div></div>
      </section>

      <section className="terminal-panel space-y-3 p-5">
        <h3 className="font-bold text-[var(--accent-yellow)]">📝 Saved notes</h3>
        {notes.length === 0 ? <p className="text-xs text-[var(--text-muted)]">Belum ada catatan tersimpan.</p> : <div className="grid gap-3 sm:grid-cols-2">{notes.map((note) => <article key={note.id} className="rounded border border-[var(--border-main)] bg-[var(--bg-app)] p-3"><h4 className="font-bold text-[var(--accent-cyan)]">{note.name}</h4><p className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs leading-5 text-[var(--text-main)]">{note.content}</p></article>)}</div>}
      </section>

      <section className="terminal-panel space-y-3 p-5 text-xs"><h3 className="font-bold text-[var(--accent-purple)]">📜 {getTranslation('profile.activityLog', lang)}</h3><div className="max-h-60 space-y-2 overflow-y-auto rounded border border-[var(--border-main)] bg-[var(--bg-app)] p-3">{activityLogs.map((log) => <div key={log.id} className="flex flex-wrap gap-2 text-[11px]"><span className="text-[var(--accent-yellow)]">[{log.timestamp}]</span><span className="text-[var(--accent-cyan)]">commit {log.commitHash}</span><span>{log.message}</span></div>)}</div></section>

      {modal === 'profile' && <ProfileModal profile={profile} onClose={() => setModal(null)} onSave={(updates) => { store.updateProfile(updates); setModal(null); }} />}
      {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} />}
    </div>
  );
}

function Stat({ value, label, color }: { value: string | number; label: string; color: 'main' | 'yellow' | 'purple' }) {
  return <div className="min-w-24 rounded-lg border border-[var(--border-main)] bg-[var(--bg-app)] p-3"><div className={`text-xl font-bold text-[var(--accent-${color})]`}>{value}</div><div className="mt-1 text-[10px] uppercase text-[var(--text-muted)]">{label}</div></div>;
}

function ModalShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}><section className="terminal-panel w-full max-w-lg overflow-hidden" onClick={(event) => event.stopPropagation()}><header className="flex items-center justify-between border-b border-[var(--border-main)] bg-[var(--bg-app)] px-5 py-4"><span className="font-bold text-[var(--accent-cyan)]">&gt; {title}</span><button onClick={onClose} className="text-[var(--text-muted)]">✕</button></header><div className="p-5">{children}</div></section></div>;
}

function ProfileModal({ profile, onClose, onSave }: { profile: UserProfile; onClose: () => void; onSave: (updates: Partial<UserProfile>) => void }) {
  const [draft, setDraft] = useState(profile);
  const submit = (event: FormEvent) => { event.preventDefault(); onSave(draft); };
  return <ModalShell title="profile --edit" onClose={onClose}><form onSubmit={submit} className="grid gap-3 text-xs"><div className="flex items-center gap-3 rounded border border-[var(--border-main)] bg-[var(--bg-app)] p-3"><div className="h-12 w-12 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${draft.avatarUrl}")` }} /><span className="text-[var(--text-muted)]">Profile identity</span></div><input className="terminal-input" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Nama" /><input className="terminal-input" value={draft.username} onChange={(event) => setDraft({ ...draft, username: event.target.value })} placeholder="Username" /><input className="terminal-input" value={draft.avatarUrl} onChange={(event) => setDraft({ ...draft, avatarUrl: event.target.value })} placeholder="URL foto profile" /><input className="terminal-input" value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} placeholder="Role" /><textarea className="terminal-input" value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} placeholder="Bio" /><button className="terminal-button terminal-button-primary">Simpan profile</button></form></ModalShell>;
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { notificationSettings, setNotificationSettings, setPassword, password, logout } = useTermFlowStore();
  const [newPassword, setNewPassword] = useState('');
  return <ModalShell title="settings --user" onClose={onClose}><div className="grid gap-4 text-xs"><label className="flex items-center gap-2"><input type="checkbox" checked={notificationSettings.enabled} onChange={(event) => setNotificationSettings({ enabled: event.target.checked })} /> Aktifkan pengingat deadline</label><label className="flex items-center gap-2">Ingatkan <select className="terminal-input w-auto" value={notificationSettings.reminderMinutes} onChange={(event) => setNotificationSettings({ reminderMinutes: Number(event.target.value) })}><option value="15">15 menit</option><option value="60">1 jam</option><option value="1440">1 hari</option><option value="2880">2 hari</option></select> sebelum deadline</label><div className="flex gap-2"><input type="password" className="terminal-input" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Password baru (min. 6)" /><button className="terminal-button" onClick={() => { if (newPassword.length >= 6) { setPassword(newPassword); setNewPassword(''); } }}>Ubah</button></div><p className="text-[10px] text-[var(--text-muted)]">Password saat ini: {password === 'termflow123' ? 'default' : 'custom'}</p><button onClick={logout} className="terminal-button text-[var(--accent-red)]">Logout</button></div></ModalShell>;
}
