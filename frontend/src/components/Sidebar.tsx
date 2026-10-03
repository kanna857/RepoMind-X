import React from 'react';
import { clsx } from 'clsx';
import { Logo, Icon, PulseDot } from './ui';

type Page = 'overview' | 'investigations' | 'patch-lab' | 'verification' | 'repositories' | 'settings';

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'investigations', label: 'Investigations', icon: 'travel_explore' },
  { id: 'patch-lab', label: 'Patch Lab', icon: 'build' },
  { id: 'verification', label: 'Verification Center', icon: 'fact_check' },
  { id: 'repositories', label: 'Repositories', icon: 'folder_data' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isDemoMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, isDemoMode }) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <div className="flex items-center gap-1.5">
              <span className="text-headline-sm font-bold tracking-tight text-on-surface">RepoMind X</span>
              <span className="text-label-sm px-1 py-0.5 bg-surface-container text-primary font-mono uppercase">
                v0.9.4-dev
              </span>
            </div>
          </div>
        </div>

        {/* Workspace Selector */}
        <div className="p-2 border-b border-outline-variant/20">
          <div className="flex items-center justify-between px-2 py-1.5 bg-surface-container-low border border-outline-variant/40 hover:border-primary/50 cursor-pointer transition-colors">
            <div className="flex items-center gap-2 overflow-hidden">
              <Icon name="dns" className="text-primary text-base" />
              <div className="flex flex-col truncate">
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Workspace</span>
                <span className="text-body-sm font-semibold text-on-surface truncate">Acme Core / Production-Cluster</span>
              </div>
            </div>
            <Icon name="unfold_more" className="text-on-surface-variant text-sm" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col py-2 px-1 gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 transition-colors w-full text-left text-body-md',
                  isActive
                    ? 'bg-surface-container-high text-primary border-l-2 border-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border-l-2 border-transparent'
                )}
              >
                <Icon name={item.icon} className="text-lg" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer telemetry */}
      <div className="p-3 border-t border-outline-variant/20 bg-surface-container-low/40 flex flex-col gap-1.5 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            <span className="text-label-sm text-on-surface truncate">
              {isDemoMode ? 'Deterministic Engine' : 'Open-Weight Model'}
            </span>
          </div>
          <span className="text-label-sm text-tertiary font-mono">Infer-Active</span>
        </div>
        <div className="flex items-center justify-between text-on-surface-variant">
          <span className="text-label-sm">Sandbox:</span>
          <span className="text-label-sm text-on-surface">Ephemeral Temp Dir</span>
        </div>
        <div className="flex items-center justify-between text-on-surface-variant">
          <span className="text-label-sm">Mode:</span>
          <span className="text-label-sm text-primary font-mono">
            {isDemoMode ? 'DEMO (No API Key)' : 'LIVE'}
          </span>
        </div>
        <div className="w-full bg-surface-container-highest h-1 overflow-hidden mt-1">
          <div className="bg-primary h-full w-[17.5%]" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
