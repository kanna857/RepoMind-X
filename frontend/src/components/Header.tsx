import React, { useState, useEffect } from 'react';
import { Icon, PulseDot } from './ui';
import { api } from '../api';

interface HeaderProps {
  onSearch?: (q: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getHealth().then(() => setIsHealthy(true)).catch(() => setIsHealthy(false));
  }, []);

  return (
    <header className="fixed top-0 left-72 right-0 h-14 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 z-40 flex items-center justify-between px-4">
      <div className="flex items-center gap-4 flex-1">
        {/* Breadcrumb */}
        <div className="items-center gap-1.5 font-mono text-label-md text-on-surface-variant hidden xl:flex">
          <span className="hover:text-on-surface cursor-pointer">repos</span>
          <span className="text-outline-variant">/</span>
          <span className="hover:text-on-surface cursor-pointer">checkout-service</span>
          <span className="text-outline-variant">/</span>
          <span className="hover:text-on-surface cursor-pointer">issues</span>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-semibold">#418 - discount_threshold_mismatch</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Icon name="search" className="absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="Search files, symbols, evidence or run command..."
            className="w-full bg-surface-container-low border border-outline-variant/30 pl-8 pr-14 py-1 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd className="text-label-sm text-on-surface-variant bg-surface-container px-1 py-0.5 border border-outline-variant/30 font-mono">⌘K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend status indicator */}
        <div className={`flex items-center gap-1.5 px-2 py-1 border ${isHealthy === null ? 'border-outline-variant/40 bg-surface-container-low' : isHealthy ? 'border-primary/30 bg-surface-container-low' : 'border-error/30 bg-error-container/20'}`}>
          <span className={`w-2 h-2 rounded-full ${isHealthy === null ? 'bg-outline animate-pulse' : isHealthy ? 'bg-primary animate-pulse' : 'bg-error'}`} />
          <span className={`text-label-sm font-mono uppercase ${isHealthy ? 'text-primary' : isHealthy === false ? 'text-error' : 'text-on-surface-variant'}`}>
            {isHealthy === null ? 'Connecting...' : isHealthy ? 'Agent Ready' : 'Backend Offline'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="hidden lg:flex items-center gap-1">
          <button className="flex items-center gap-1 px-2 py-1 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface text-label-sm transition-colors">
            <Icon name="play_circle" className="text-sm text-tertiary" />
            Run Sandbox Tests
          </button>
          <button className="flex items-center gap-1 px-2 py-1 bg-surface-container-low border border-outline-variant/40 text-on-surface-variant text-label-sm font-mono hover:text-on-surface">
            <Icon name="fork_right" className="text-sm" />
            fix/discount-boundary
          </button>
        </div>

        <div className="h-4 w-px bg-outline-variant/30" />

        {/* Notifications + Avatar */}
        <div className="flex items-center gap-2">
          <button className="relative p-1 text-on-surface-variant hover:text-on-surface transition-colors">
            <Icon name="notifications" className="text-lg" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
          </button>
          <button className="p-1 text-on-surface-variant hover:text-on-surface transition-colors">
            <Icon name="menu_book" className="text-lg" />
          </button>
          <div className="relative flex items-center">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-outline-variant/50"
              src="/avatar.png"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><rect width='32' height='32' fill='%23161B22'/><text x='16' y='21' text-anchor='middle' fill='%234cd7f6' font-size='14' font-family='monospace'>A</text></svg>`;
              }}
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-tertiary ring-2 ring-surface-container-lowest" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
