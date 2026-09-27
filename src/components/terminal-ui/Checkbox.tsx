'use client';

import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  className?: string;
}

export default function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`inline-flex items-center gap-2 ${className || ''}`}
    >
      <div
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked
            ? 'border-[var(--accent-main)] bg-[var(--accent-main)] text-[var(--bg-app)]'
            : 'border-[var(--border-main)] bg-[var(--bg-app)] hover:border-[var(--accent-main)]'
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </div>
      {label && <span className="text-xs">{label}</span>}
    </button>
  );
}
