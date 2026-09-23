'use client';

import { FormEvent, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTermFlowStore } from '@/lib/store';
import { Lock, KeyRound, Terminal, Eye, EyeOff } from 'lucide-react';

export default function LoginGate() {
  const login = useTermFlowStore((state) => state.login);
  const storedPassword = useTermFlowStore((state) => state.password);
  const [password, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const loadingMessages = [
    'verifying credentials...',
    'decrypting workspace...',
    'loading projects & tasks...',
    'ready ✓',
  ];

  useEffect(() => {
    if (!isLoading) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    // stagger step messages
    timers.push(setTimeout(() => setLoadingStep(1), 380));
    timers.push(setTimeout(() => setLoadingStep(2), 820));
    timers.push(setTimeout(() => setLoadingStep(3), 1220));
    timers.push(
      setTimeout(() => {
        setIsSuccess(true);
        // small pause on success before actually logging in
        setTimeout(() => {
          login(password);
        }, 420);
      }, 1350)
    );
    return () => timers.forEach(clearTimeout);
  }, [isLoading, login, password]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    // client-side check without triggering store auth yet
    if (password !== storedPassword) {
      setError('Password salah. Silakan coba lagi.');
      return;
    }
    setError('');
    setIsLoading(true);
    setLoadingStep(0);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] p-4 font-mono">
      <AnimatePresence mode="wait">
        {!isLoading ? (
          <motion.form
            key="login-form"
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.985 }}
            transition={{ duration: 0.22, ease: [0.22, 0.8, 0.24, 1] }}
            onSubmit={submit}
            className="terminal-panel w-full max-w-md space-y-5 p-6 sm:p-7"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--accent-main)]/40 bg-[var(--accent-main)]/10 text-[var(--accent-main)] text-2xl"
              >
                ⌘
              </motion.div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-bright)]">termflow@local</h1>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Authentication required — enter password to continue</p>
            </div>

            <label className="block text-xs font-bold tracking-wide text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><Lock size={12} strokeWidth={2} /> PASSWORD</span>
              <input
                autoFocus
                type="password"
                value={password}
                onChange={(event) => {
                  setPasswordInput(event.target.value);
                  setError('');
                }}
                className="terminal-input mt-2 font-mono text-sm"
                placeholder="Masukkan password"
              />
            </label>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded border border-[var(--accent-red)]/40 bg-[var(--accent-red)]/10 px-3 py-2.5 text-xs text-[var(--accent-red)]"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="terminal-button terminal-button-primary w-full py-2.5 text-sm tracking-wide"
            >
              <KeyRound size={16} className="mr-2 inline" /> Login ↵
            </button>
            <p className="text-center text-[10px] leading-relaxed text-[var(--text-muted)]">Lupa password? Atur ulang via Profile → Settings setelah login.</p>
</motion.form>
        ) : (
          <motion.div
            key="login-loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="terminal-panel w-full max-w-md overflow-hidden p-0"
          >
            {/* terminal header bar */}
            <div className="flex items-center gap-1.5 border-b border-[var(--border-main)] bg-[var(--bg-app)] px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-[var(--accent-red)]/80" />
              <span className="h-3 w-3 rounded-full bg-[var(--accent-yellow)]/80" />
              <span className="h-3 w-3 rounded-full bg-[var(--accent-main)]/80" />
              <span className="ml-3 text-[11px] tracking-wide text-[var(--text-muted)]">termflow — authenticating</span>
            </div>

            <div className="space-y-4 p-6">
              <div className="space-y-2 font-mono text-xs">
                {loadingMessages.slice(0, loadingStep + 1).map((msg, idx) => (
                  <motion.div
                    key={msg}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22 }}
                    className={`flex items-center gap-2 ${idx === loadingMessages.length - 1 && isSuccess ? 'text-[var(--accent-main)]' : idx <= loadingStep ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}
                  >
                    <span className="text-[var(--accent-cyan)]">$</span>
                    <span>{msg}</span>
                    {idx === loadingStep && idx < loadingMessages.length - 1 && (
                      <span className="inline-flex gap-0.5">
                        <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1.1 }} className="h-1 w-1 rounded-full bg-[var(--accent-cyan)]" />
                        <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1.1, delay: 0.2 }} className="h-1 w-1 rounded-full bg-[var(--accent-cyan)]" />
                        <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1.1, delay: 0.4 }} className="h-1 w-1 rounded-full bg-[var(--accent-cyan)]" />
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* progress bar */}
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-app)] border border-[var(--border-main)]/50">
                <motion.div
                  className="h-full bg-[var(--accent-main)]"
                  initial={{ width: '0%' }}
                  animate={{ width: isSuccess ? '100%' : `${18 + loadingStep * 26}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 0.8, 0.24, 1] }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 animate-spin rounded-full border-2 border-[var(--border-main)] border-t-[var(--accent-cyan)]" />
                  {isSuccess ? 'Authenticated' : 'Please wait...'}
                </span>
                <span className="tabular-nums text-[var(--accent-main)]">{isSuccess ? '100%' : `${Math.min(94, 22 + loadingStep * 24)}%`}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
