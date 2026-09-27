'use client';
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

type DropdownContextValue = {
  activeId: string | null;
  open: (id: string) => void;
  close: (id: string) => void;
  toggle: (id: string) => void;
  closeAll: () => void;
  isOpen: (id: string) => boolean;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

export function DropdownProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const open = useCallback((id: string) => setActiveId(id), []);
  const close = useCallback((id: string) => setActiveId((prev) => (prev === id ? null : prev)), []);
  const toggle = useCallback((id: string) => setActiveId((prev) => (prev === id ? null : id)), []);
  const closeAll = useCallback(() => setActiveId(null), []);
  const isOpen = useCallback((id: string) => activeId === id, [activeId]);

  // Global: Esc closes, scroll closes, click outside handled per-dropdown via context closeAll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveId(null);
    };
    const onScroll = () => {
      // close on any scroll (capture phase, with slight debounce)
      if (activeId) setActiveId(null);
    };
    document.addEventListener('keydown', onKey);
    // scroll on window + any scrollable ancestor
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [activeId]);

  // Click outside: if click is outside header area or any dropdown portal, closeAll
  // We handle via global mousedown that closes if target is not inside an element with [data-dropdown-id]
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!activeId) return;
      const target = e.target as HTMLElement;
      // if click inside any dropdown trigger/content, let that component handle it (via its own ref check)
      // This global fallback just closes when clicking outside all dropdown containers
      // We mark dropdown containers with data-dropdown-id
      const inside = target.closest('[data-dropdown-id]');
      if (!inside) {
        // Click completely outside -> close
        setActiveId(null);
        return;
      }
      // If click inside a different dropdown than active, the toggle handler of that dropdown
      // will already set activeId to its id. So no need to handle here.
      // If click inside active dropdown, keep open (handled by component).
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [activeId]);

  return (
    <DropdownContext.Provider value={{ activeId, open, close, toggle, closeAll, isOpen }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdown(id: string) {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('useDropdown must be used within DropdownProvider');
  return {
    isOpen: ctx.isOpen(id),
    open: () => ctx.open(id),
    close: () => ctx.close(id),
    toggle: () => ctx.toggle(id),
    closeAll: ctx.closeAll,
    activeId: ctx.activeId,
  };
}

export function useDropdownContext() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('useDropdownContext must be used within DropdownProvider');
  return ctx;
}
