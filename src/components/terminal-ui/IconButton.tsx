'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';

type IconButtonVariant = 'ghost' | 'solid' | 'outline';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string; // aria-label + tooltip
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  active?: boolean;
  iconSize?: number;
  strokeWidth?: number;
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8 min-h-[32px] min-w-[32px]',
  md: 'h-10 w-10 min-h-40px min-w-[40px] sm:h-9 sm:w-9',
  lg: 'h-11 w-11 min-h-[44px] min-w-[44px]',
};

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: 'border border-transparent bg-transparent text-[var(--text-muted)] hover:border-[var(--border-main)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-main)]',
  solid: 'border border-[var(--accent-main)] bg-[var(--accent-main)] text-[var(--bg-app)] hover:bg-[var(--accent-hover)]',
  outline: 'border border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-muted)] hover:border-[var(--accent-cyan)]/40 hover:text-[var(--text-main)]',
};

export default function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  active = false,
  iconSize = 16,
  strokeWidth = 1.75,
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-0 active:scale-[0.97] ${sizeClasses[size]} ${active ? 'border-[var(--accent-cyan)]/40 bg-[var(--bg-muted)] text-[var(--text-bright)]' : variantClasses[variant]} ${className}`}
      style={{ minWidth: 40, minHeight: 40 }}
      {...props}
    >
      <Icon size={iconSize} strokeWidth={strokeWidth} className="shrink-0" aria-hidden />
    </button>
  );
}

// Text+icon button helper — gap 6-8px, icon 16-18px, stroke 1.75
export function ButtonWithIcon({
  icon: Icon,
  children,
  iconSize = 16,
  strokeWidth = 1.75,
  gapClass = 'gap-1.5',
  ...props
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  iconSize?: number;
  strokeWidth?: number;
  gapClass?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return (
    <button className={`inline-flex items-center justify-center ${gapClass} ${className}`} {...rest}>
      <Icon size={iconSize} strokeWidth={strokeWidth} className="shrink-0" aria-hidden />
      <span>{children}</span>
    </button>
  );
}

// Custom terminal prompt icon — block cursor / ">_" (stroke-based, matches Lucide style)
export function TerminalPromptIcon({ size = 16, strokeWidth = 1.75, className = '' }: { size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}
