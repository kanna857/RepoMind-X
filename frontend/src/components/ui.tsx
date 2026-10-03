import React from 'react';
import { clsx } from 'clsx';

// Logo SVG component - matches the supplied design
export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className}>
    <rect width="48" height="48" rx="12" fill="#161B22" stroke="#30363D" strokeWidth="1.5" />
    <path d="M14 16L22 24L14 32" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M26 32H34" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="28" cy="18" r="4" stroke="#A78BFA" strokeWidth="2" fill="#1F1B2E" />
    <path d="M31 21L35 25" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Material Symbols icon wrapper
export const Icon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <span className={clsx('material-symbols-outlined select-none', className)} aria-hidden="true">
    {name}
  </span>
);

// Animated pulse dot indicator
export const PulseDot: React.FC<{ color?: string; className?: string }> = ({
  color = 'bg-primary',
  className,
}) => (
  <span className={clsx('flex h-2 w-2 relative', className)}>
    <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', color)} />
    <span className={clsx('relative inline-flex rounded-full h-2 w-2', color)} />
  </span>
);

// Status chip/badge
export const StatusBadge: React.FC<{
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'muted';
  className?: string;
}> = ({ label, variant = 'muted', className }) => {
  const variants = {
    primary: 'bg-primary/10 text-primary border border-primary/30',
    secondary: 'bg-secondary-container/20 text-secondary border border-secondary/30',
    tertiary: 'bg-tertiary-container/20 text-tertiary border border-tertiary/30',
    error: 'bg-error-container text-error',
    muted: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/40',
  };
  return (
    <span className={clsx('text-label-sm px-1.5 py-0.5 font-mono uppercase tracking-wider inline-flex items-center gap-1', variants[variant], className)}>
      {label}
    </span>
  );
};

// Loading spinner
export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <Icon name="sync" className={clsx('animate-spin text-primary', className)} />
);

// Demo mode banner
export const DemoModeBanner: React.FC = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-container/20 border border-secondary/30 text-secondary text-label-md font-mono uppercase tracking-wider">
    <Icon name="science" className="text-sm" />
    <span>Demo Mode — Deterministic Rule-Based Engine — No AI Model Called</span>
  </div>
);

// Simple button
export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'error';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  id?: string;
}> = ({ children, onClick, variant = 'ghost', disabled, loading, className, id }) => {
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-fixed',
    secondary: 'bg-secondary text-on-secondary hover:opacity-90',
    ghost: 'bg-surface-container-high border border-outline-variant/40 text-on-surface hover:border-primary/50',
    error: 'bg-error-container/20 text-error hover:bg-error-container/40 border border-error/30',
  };
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 text-label-md font-space uppercase tracking-wider transition-colors duration-150 active:scale-95 disabled:opacity-50',
        variants[variant],
        className
      )}
    >
      {loading && <Spinner className="text-sm" />}
      {children}
    </button>
  );
};

// Metric card matching the Stitch design
export const MetricCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  icon?: string;
  accentColor?: string;
}> = ({ label, value, sub, trend, icon, accentColor = 'bg-primary' }) => (
  <div className="p-4 bg-surface-container-lowest hover:bg-surface-container-low/40 transition-colors border border-outline-variant/20 flex flex-col justify-between group">
    <div className="flex items-center justify-between text-on-surface-variant">
      <span className="text-label-sm uppercase font-mono tracking-wider">{label}</span>
      {icon && <Icon name={icon} className="text-base group-hover:text-primary transition-colors" />}
    </div>
    <div className="my-3 flex items-baseline gap-2">
      <span className="text-headline-xl text-on-surface font-mono font-bold tracking-tight">{value}</span>
      {trend && <span className="text-label-sm text-tertiary font-mono flex items-center">{trend}</span>}
    </div>
    {sub && (
      <div className="flex items-center justify-between font-mono text-on-surface-variant border-t border-outline-variant/10 pt-1">
        <span className="text-body-sm">{sub}</span>
        <span className={clsx('w-1 h-1 rounded-full', accentColor)} />
      </div>
    )}
  </div>
);

// Evidence badge (E1, E2, E3)
export const EvidenceBadge: React.FC<{ id: string; type?: 'primary' | 'error' | 'secondary' }> = ({
  id,
  type = 'primary',
}) => {
  const colors = {
    primary: 'bg-primary/20 text-primary border-primary/40',
    error: 'bg-error-container text-error border-error/40',
    secondary: 'bg-surface-container text-secondary border-secondary/30',
  };
  return (
    <span className={clsx('px-1.5 py-0.5 text-label-sm font-mono border', colors[type])}>
      {id}
    </span>
  );
};

// Code diff line component
export const DiffLine: React.FC<{
  oldLine?: number;
  newLine?: number;
  type: 'context' | 'add' | 'remove';
  content: string;
}> = ({ oldLine, newLine, type, content }) => {
  const bg = {
    context: 'hover:bg-surface-container/60',
    add: 'bg-tertiary-container/25 hover:bg-tertiary-container/35',
    remove: 'bg-error-container/20 hover:bg-error-container/30',
  };
  const marker = { context: ' ', add: '+', remove: '−' };
  const markerColor = { context: 'text-outline', add: 'text-tertiary font-bold', remove: 'text-error font-bold' };
  const textColor = { context: 'text-on-surface-variant', add: 'text-tertiary', remove: 'text-error' };

  return (
    <div className={clsx('flex transition-colors', bg[type])}>
      <div className="w-10 text-right pr-2 py-0.5 text-outline select-none bg-surface-container-low/40 text-[10px]">
        {type !== 'add' ? oldLine : ''}
      </div>
      <div className="w-10 text-right pr-2 py-0.5 text-outline select-none bg-surface-container-low/40 text-[10px]">
        {type !== 'remove' ? newLine : ''}
      </div>
      <div className={clsx('w-6 text-center py-0.5 select-none text-[10px]', markerColor[type])}>
        {marker[type]}
      </div>
      <div className={clsx('px-2 py-0.5 whitespace-pre font-mono text-[10px] flex-1', textColor[type])}>
        {content}
      </div>
    </div>
  );
};

// Terminal output block
export const TerminalOutput: React.FC<{
  lines: string[];
  className?: string;
}> = ({ lines, className }) => (
  <div className={clsx('bg-surface-container-lowest p-3 font-mono text-[10px] leading-5 overflow-x-auto', className)}>
    {lines.map((line, i) => {
      const color = line.includes('PASSED') || line.includes('passed')
        ? 'text-tertiary'
        : line.includes('FAILED') || line.includes('failed') || line.startsWith('E ')
        ? 'text-error'
        : line.startsWith('$') || line.startsWith('>')
        ? 'text-primary'
        : 'text-on-surface-variant';
      return (
        <div key={i} className={color}>
          {line}
        </div>
      );
    })}
  </div>
);
