'use client';

import { FormEvent, useState } from 'react';
import { useTermFlowStore } from '@/lib/store';

export default function LoginGate() {
  const login = useTermFlowStore((state) => state.login);
  const [password, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!login(password)) setError('Password salah. Gunakan password default: termflow123');
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] p-4 font-mono">
      <form onSubmit={submit} className="terminal-panel w-full max-w-md space-y-5 p-6">
        <div className="text-center"><div className="mb-2 text-3xl text-[var(--accent-main)]">⌘</div><h1 className="text-xl font-bold text-[var(--text-bright)]">termflow@local</h1><p className="mt-1 text-xs text-[var(--text-muted)]">Authentication required</p></div>
        <label className="block text-xs text-[var(--text-muted)]">PASSWORD<input autoFocus type="password" value={password} onChange={(event) => { setPasswordInput(event.target.value); setError(''); }} className="terminal-input mt-2" placeholder="Masukkan password" /></label>
        {error && <p className="rounded border border-[var(--accent-red)]/40 bg-[var(--accent-red)]/10 p-2 text-xs text-[var(--accent-red)]">{error}</p>}
        <button className="terminal-button terminal-button-primary w-full">Login ↵</button>
        <p className="text-center text-[10px] text-[var(--text-muted)]">Password default: <code>termflow123</code>. Ubah melalui Profile → Settings.</p>
      </form>
    </main>
  );
}
