import React, { useEffect, useState } from 'react';
import { api, Investigation, Repository } from '../api';
import { Icon, PulseDot, MetricCard, EvidenceBadge, DemoModeBanner, Button, Spinner } from '../components/ui';
import { clsx } from 'clsx';

const PIPELINE_STAGES = [
  { n: '01', label: '1. Repository Scan', sub: 'Indexed AST & Call Trees', color: 'primary' },
  { n: '02', label: '2. Evidence Collection', sub: 'Call Graph & Dynamic State', color: 'primary' },
  { n: '03', label: '3. Root Cause Analysis', sub: 'Confidence-Scored Vector', color: 'secondary' },
  { n: '04', label: '4. Patch Proposal', sub: 'Minimal AST Edit Diff', color: 'secondary' },
  { n: '05', label: '5. Test Execution', sub: 'Isolated Ephemeral Sandbox', color: 'tertiary' },
  { n: '06', label: '6. Verification Report', sub: 'Cryptographic Signed Proof', color: 'tertiary' },
];

interface OverviewPageProps {
  onNavigate: (page: string) => void;
}

const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [health, setHealth] = useState<{ is_rule_based_fallback: boolean; ai_provider: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getInvestigations(),
      api.getRepositories(),
      api.getHealth(),
    ]).then(([invs, repos, h]) => {
      setInvestigations(invs);
      setRepositories(repos);
      setHealth(h);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalPassed = 1420;
  const patchesVerified = 82;
  const issuesInvestigated = 94;

  return (
    <div className="flex flex-col w-full">
      {/* Command Deck Banner */}
      <div className="p-4 xl:p-6 bg-surface-container-lowest border-b border-outline-variant/30 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <PulseDot color="bg-tertiary" />
              <span className="text-label-sm uppercase tracking-widest text-on-surface-variant font-mono">Good morning, developer.</span>
              <span className="text-outline-variant text-body-sm">•</span>
              <span className="text-label-sm text-primary font-mono bg-surface-container-high px-1 py-0.5">HEURISTIC ENGINE ONLINE</span>
            </div>
            <h1 className="text-headline-xl text-on-surface tracking-tight font-bold">
              Your codebase,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-fixed to-secondary">
                investigated.
              </span>
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">
              Find root causes, inspect mathematical AST evidence, and verify deterministic fixes inside isolated sandboxes before committing.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {health?.is_rule_based_fallback && <DemoModeBanner />}
            <Button variant="secondary" onClick={() => onNavigate('investigations')} id="btn-start-investigation">
              <Icon name="add" className="text-base" />
              Start Investigation
            </Button>
            <Button variant="ghost" onClick={() => onNavigate('repositories')}>
              <Icon name="play_arrow" className="text-base text-primary" />
              Explore Demo Repo
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-surface-container-lowest border-b border-outline-variant/30">
        <MetricCard label="Total Investigations" value={loading ? '…' : investigations.length + 125} trend="↑ +12% this week" icon="travel_explore" sub="Automated Triage" />
        <MetricCard label="Issues Investigated" value={issuesInvestigated} trend="89% Confidence" icon="bug_report" sub="Avg Analysis Time: 41.2s" accentColor="bg-secondary" />
        <MetricCard label="Patches Verified" value={patchesVerified} trend="Clean Sandbox" icon="verified" sub="100% Isolated Sandbox Execs" accentColor="bg-tertiary" />
        <MetricCard label="Tests Passed" value="1,420" trend="0 regressions" icon="fact_check" sub="Regression Delta: 0.00%" />
      </div>

      {/* Pipeline Banner */}
      <div className="bg-surface-container-low/70 border-b border-outline-variant/30 p-3 xl:px-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-label-md uppercase font-mono tracking-widest text-primary font-bold">Investigation Lifecycle Pipeline</span>
            <span className="text-label-sm text-outline px-1.5 py-0.5 bg-surface-container">E2E Autonomous Verification</span>
          </div>
          <span className="text-label-sm font-mono text-on-surface-variant hidden md:inline">Click stage node to view telemetry protocols</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-outline-variant/20 border border-outline-variant/30">
          {PIPELINE_STAGES.map((s) => (
            <button
              key={s.n}
              onClick={() => {
                if (['01', '02'].includes(s.n)) onNavigate('repositories');
                else if (['03', '04'].includes(s.n)) onNavigate('investigations');
                else if (s.n === '05') onNavigate('patch-lab');
                else onNavigate('verification');
              }}
              className="bg-surface-container-lowest p-2 hover:bg-surface-container-high transition-colors cursor-pointer group relative text-left"
            >
              <div className="flex items-center justify-between text-on-surface-variant mb-1 font-mono">
                <span className={clsx('text-label-sm', `text-${s.color}`)}>STAGE {s.n}</span>
                <Icon name={['account_tree', 'hub', 'psychology', 'code_blocks', 'terminal', 'verified_user'][parseInt(s.n) - 1]} className={clsx('text-sm', `text-${s.color}`)} />
              </div>
              <div className="text-label-md font-bold text-on-surface">{s.label}</div>
              <div className="text-body-sm text-on-surface-variant truncate">{s.sub}</div>
              <div className={clsx('absolute bottom-0 left-0 right-0 h-0.5', `bg-${s.color}`)} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-0 flex-1">
        {/* Left: Investigations table */}
        <div className="xl:col-span-8 flex flex-col border-b xl:border-b-0 xl:border-r border-outline-variant/30 bg-surface">
          <div className="h-10 px-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="view_timeline" className="text-base text-primary" />
              <span className="text-label-md uppercase font-mono font-bold tracking-wider text-on-surface">Active &amp; Recent Investigations</span>
              <span className="text-label-sm px-1.5 py-0.5 bg-surface-container-highest text-on-surface-variant font-mono">
                {loading ? '…' : `${investigations.length} Live Workspaces`}
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono">
              <button className="px-1 py-0.5 text-label-sm text-on-surface-variant hover:text-on-surface bg-surface-container border border-outline-variant/30">FILTER: ALL</button>
              <button className="px-1 py-0.5 text-label-sm text-on-surface-variant hover:text-on-surface bg-surface-container border border-outline-variant/30">SORT: TIME</button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Spinner className="text-2xl" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest/80 border-b border-outline-variant/20 text-on-surface-variant font-mono text-label-sm">
                    <th className="py-2 px-4 font-semibold uppercase">Issue / PR Descriptor</th>
                    <th className="py-2 px-3 font-semibold uppercase">Repository</th>
                    <th className="py-2 px-3 font-semibold uppercase">Status</th>
                    <th className="py-2 px-3 font-semibold uppercase">Latency</th>
                    <th className="py-2 px-4 text-right font-semibold uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-mono text-body-sm">
                  {investigations.map((inv) => {
                    const isActive = inv.status.includes('Hypothesis') || inv.status.includes('In Progress');
                    const isVerified = inv.status.includes('Verified');
                    return (
                      <tr key={inv.id} className="hover:bg-surface-container-high/40 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-2">
                            <EvidenceBadge id={inv.evidence_markers.join('-')} type={isActive ? 'primary' : 'secondary'} />
                            <div className="flex flex-col">
                              <span className="text-label-md text-on-surface font-bold group-hover:text-primary transition-colors flex items-center gap-1">
                                #{inv.issue_number} {inv.title}
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping ml-1" />}
                              </span>
                              <span className="text-body-sm text-on-surface-variant font-sans line-clamp-1">{inv.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-on-surface-variant whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Icon name="dns" className="text-sm text-outline" />
                            <span className="text-on-surface">{inv.repo}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className={clsx(
                            'inline-flex items-center gap-1.5 px-1 py-0.5 text-label-sm',
                            isVerified ? 'bg-tertiary-container/20 border border-tertiary/40 text-tertiary' :
                            isActive ? 'bg-secondary-container/20 border border-secondary/40 text-secondary' :
                            'bg-surface-container-highest border border-outline-variant/50 text-on-surface-variant'
                          )}>
                            <span className={clsx('w-1.5 h-1.5 rounded-full', isVerified ? 'bg-tertiary' : isActive ? 'bg-secondary' : 'bg-primary animate-pulse')} />
                            {inv.status}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-on-surface-variant font-mono whitespace-nowrap">{inv.latency}</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => onNavigate(isVerified ? 'verification' : 'investigations')}
                            className={clsx(
                              'px-2 py-1 text-label-sm font-mono font-bold transition-colors',
                              isActive ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-high border border-outline-variant/40 text-on-surface hover:border-primary/50'
                            )}
                          >
                            {isActive ? 'OPEN WORKSPACE' : 'VIEW DIFF'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Featured Demo Card */}
          <div className="m-3 border border-outline-variant/40 bg-surface-container-lowest relative overflow-hidden">
            <div className="h-0.5 w-full bg-gradient-to-r from-primary via-secondary to-tertiary" />
            <div className="p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div className="flex flex-col gap-1.5 max-w-md">
                <div className="flex items-center gap-1.5 font-mono">
                  <Icon name="science" className="text-secondary text-sm" />
                  <span className="text-label-sm uppercase tracking-wider text-secondary font-bold">Guided Interactive Walkthrough</span>
                </div>
                <h3 className="text-headline-md font-bold text-on-surface">See RepoMind investigate a real bug.</h3>
                <p className="text-body-sm text-on-surface-variant font-sans">
                  Watch the AST engine trace the discount failure from failing pytest assertion, generate mathematically minimal delta, and verify sandbox tests in 18 seconds.
                </p>
                <div className="pt-1">
                  <Button variant="secondary" onClick={() => onNavigate('investigations')}>
                    <Icon name="terminal" className="text-sm" />
                    Launch Interactive Demo
                  </Button>
                </div>
              </div>
              {/* Mini diff preview */}
              <div className="w-full lg:w-96 bg-surface-container-low border border-outline-variant/30 font-mono text-body-sm p-2">
                <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20 mb-1 text-on-surface-variant">
                  <span className="text-label-sm">services/checkout/pricing.py</span>
                  <span className="text-label-sm text-error bg-error-container/20 px-1">FAILED: test_tier3</span>
                </div>
                <div className="space-y-0.5">
                  <div className="bg-error-container/20 text-error px-1 flex items-center justify-between text-[10px]">
                    <span>- if total &gt;= DISCOUNT_THRESHOLD:</span>
                    <span className="text-label-sm opacity-60">L:20</span>
                  </div>
                  <div className="bg-tertiary-container/20 text-tertiary px-1 flex items-center justify-between text-[10px]">
                    <span>+ if total &gt; DISCOUNT_THRESHOLD:</span>
                    <span className="text-label-sm opacity-60">L:20</span>
                  </div>
                </div>
                <div className="mt-2 pt-1 border-t border-outline-variant/20 flex items-center justify-between text-label-sm text-on-surface-variant">
                  <span className="flex items-center gap-1 text-tertiary"><Icon name="done_all" className="text-xs" /> Pytest: 8/8 Passed</span>
                  <span className="text-primary">Δ: 1 line (Minimal)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Repos + Activity */}
        <div className="xl:col-span-4 flex flex-col bg-surface-container-lowest">
          {/* Connected Repos */}
          <div className="border-b border-outline-variant/30">
            <div className="h-10 px-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon name="lan" className="text-base text-primary" />
                <span className="text-label-md uppercase font-mono font-bold tracking-wider text-on-surface">Connected Repositories</span>
              </div>
              <span className="text-label-sm font-mono text-tertiary">
                {repositories.filter(r => r.status === 'ONLINE').length} ONLINE
              </span>
            </div>
            <div className="p-3 space-y-2">
              {loading ? <Spinner /> : repositories.map((repo) => (
                <div key={repo.id} className="p-2 bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={clsx('w-2 h-2 rounded-none', repo.status === 'ONLINE' ? 'bg-tertiary' : 'bg-primary')} />
                      <span className="text-label-md font-mono font-bold text-on-surface">{repo.name}</span>
                    </div>
                    <span className={clsx('text-label-sm font-mono', repo.status === 'ONLINE' ? 'text-tertiary' : 'text-primary')}>
                      {repo.status === 'INDEXING' ? `INDEXING (${repo.indexing_progress}%)` : '100% INDEXED'}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-1 overflow-hidden">
                    <div
                      className={clsx('h-full', repo.status === 'ONLINE' ? 'bg-primary' : 'bg-primary animate-pulse')}
                      style={{ width: `${repo.indexing_progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-label-sm text-on-surface-variant font-mono">
                    <span>AST Nodes: {repo.ast_nodes.toLocaleString()}</span>
                    <span>Coverage: {repo.test_coverage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity */}
          <div className="flex flex-col flex-1">
            <div className="h-10 px-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon name="stream" className="text-base text-secondary" />
                <span className="text-label-md uppercase font-mono font-bold tracking-wider text-on-surface">Live Execution Activity</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between space-y-3 font-mono">
              <div className="space-y-2 relative before:absolute before:inset-0 before:left-2 before:w-px before:bg-outline-variant/30">
                {[
                  { color: 'bg-primary', time: '10:42:19.04', tag: 'SANDBOX', text: 'Pytest executed in ephemeral dir — ', highlight: '1/8 failed', hcolor: 'text-error' },
                  { color: 'bg-secondary', time: '10:42:15.82', tag: 'SYNTHESIS', text: 'Minimal patch synthesized for ', highlight: '#418', hcolor: 'text-primary' },
                  { color: 'bg-primary', time: '10:41:58.11', tag: 'EVIDENCE', text: 'Evidence marker ', highlight: 'E1', hcolor: 'text-primary' },
                  { color: 'bg-tertiary', time: '10:39:04.90', tag: 'VERIFY', text: 'Signed verification proof emitted for ', highlight: '#402', hcolor: 'text-tertiary' },
                ].map((ev, i) => (
                  <div key={i} className="flex items-start gap-2 relative pl-6">
                    <span className={clsx('absolute left-1 top-1 w-2 h-2 rounded-none', ev.color)} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className={clsx('text-label-sm font-bold', ev.color.replace('bg-', 'text-'))}>{ev.time}</span>
                        <span className="text-label-sm px-1 bg-surface-container-high text-on-surface-variant">{ev.tag}</span>
                      </div>
                      <span className="text-body-sm text-on-surface font-sans">
                        {ev.text}<span className={clsx('font-mono', ev.hcolor)}>{ev.highlight}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-1.5 bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-on-surface-variant">
                <span className="text-label-sm flex items-center gap-1">
                  <Icon name="terminal" className="text-xs text-primary" />daemon: repo-watch --live
                </span>
                <span className="text-label-sm text-tertiary font-mono">PID: 9021</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-2 px-4 bg-surface-container-lowest border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-1 font-mono">
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <Icon name="info" className="text-sm text-secondary" />
          <span className="text-label-sm">Demo Environment: Deterministic sample data. Sandboxes strictly isolated.</span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <span className="text-label-sm">Security Policy: <span className="text-tertiary">Zero Outbound Telemetry</span></span>
          <span className="text-label-sm text-outline">|</span>
          <span className="text-label-sm font-mono text-primary">SHA: c9f30b2</span>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
