import React, { useEffect, useState, useCallback } from 'react';
import { api, Investigation } from '../api';
import { Icon, Button, Spinner, EvidenceBadge, TerminalOutput, DemoModeBanner } from '../components/ui';
import { clsx } from 'clsx';

type Stage = 'list' | 'reproduce' | 'evidence' | 'hypothesize' | 'done';

const InvestigationsPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selected, setSelected] = useState<Investigation | null>(null);
  const [stage, setStage] = useState<Stage>('list');
  const [loading, setLoading] = useState(true);
  const [stageBusy, setStageBusy] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [hypothesis, setHypothesis] = useState<{ title: string; confidence: number; diagnosis: string; is_rule_based_fallback: boolean; disclaimer: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getInvestigations()
      .then(setInvestigations)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const selectInvestigation = (inv: Investigation) => {
    setSelected(inv);
    setStage('reproduce');
    setOutput([]);
    setHypothesis(null);
    setError(null);
  };

  const handleReproduce = useCallback(async () => {
    if (!selected) return;
    setStageBusy(true);
    setOutput(['$ python -m pytest tests/ -v', '...']);
    try {
      const res = await api.reproduceBug(selected.id);
      setOutput(res.stdout.split('\n'));
      if (res.reproduced) setStage('evidence');
    } catch (e) {
      setError(String(e));
    } finally {
      setStageBusy(false);
    }
  }, [selected]);

  const handleCollectEvidence = useCallback(async () => {
    if (!selected) return;
    setStageBusy(true);
    setOutput(['$ repomind collect-evidence --issue=' + selected.id, 'Scanning AST...']);
    try {
      const res = await api.collectEvidence(selected.id);
      const lines = [`Evidence collected: ${(res.evidence as unknown[]).length} markers`, ...(res.evidence as unknown[]).map((e: unknown) => {
        const ev = e as { id: string; type: string; file: string; line?: number; note?: string };
        return `  [${ev.id}] ${ev.type}: ${ev.file}:${ev.line ?? '?'} – ${ev.note ?? ''}`;
      })];
      setOutput(lines);
      setStage('hypothesize');
    } catch (e) {
      setError(String(e));
    } finally {
      setStageBusy(false);
    }
  }, [selected]);

  const handleHypothesis = useCallback(async () => {
    if (!selected) return;
    setStageBusy(true);
    setOutput(['$ repomind hypothesize --issue=' + selected.id, 'Analyzing AST vectors...']);
    try {
      const res = await api.generateHypothesis(selected.id);
      setHypothesis(res);
      setOutput([
        `Root Cause: ${res.title}`,
        `Confidence: ${Math.round(res.confidence * 100)}%`,
        '',
        res.diagnosis,
      ]);
      setStage('done');
    } catch (e) {
      setError(String(e));
    } finally {
      setStageBusy(false);
    }
  }, [selected]);

  const STAGE_FLOW: { id: Stage; label: string; icon: string }[] = [
    { id: 'reproduce', label: 'Reproduce Bug', icon: 'bug_report' },
    { id: 'evidence', label: 'Collect Evidence', icon: 'hub' },
    { id: 'hypothesize', label: 'Analyze Root Cause', icon: 'psychology' },
    { id: 'done', label: 'View Hypothesis', icon: 'lightbulb' },
  ];

  const stageIndex = STAGE_FLOW.findIndex(s => s.id === stage);

  return (
    <div className="flex h-full w-full">
      {/* Investigation list panel */}
      <div className="w-80 flex-none border-r border-outline-variant/30 bg-surface-container-lowest flex flex-col">
        <div className="h-10 px-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon name="travel_explore" className="text-base text-primary" />
            <span className="text-label-md uppercase font-mono font-bold text-on-surface">Investigations</span>
          </div>
          <span className="text-label-sm text-on-surface-variant font-mono">{investigations.length}</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-8"><Spinner className="text-xl" /></div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {investigations.map((inv) => {
              const isSelected = selected?.id === inv.id;
              return (
                <button
                  key={inv.id}
                  onClick={() => selectInvestigation(inv)}
                  className={clsx(
                    'w-full text-left p-3 border-b border-outline-variant/20 transition-colors hover:bg-surface-container-high',
                    isSelected ? 'bg-surface-container-high border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <EvidenceBadge id={inv.evidence_markers[0] || 'E?'} type={inv.reproduced ? 'error' : 'secondary'} />
                    <span className="text-label-sm font-mono font-bold text-on-surface">#{inv.issue_number}</span>
                    <span className={clsx('w-1.5 h-1.5 rounded-full ml-auto', inv.reproduced ? 'bg-error' : 'bg-primary animate-pulse')} />
                  </div>
                  <p className="text-body-sm text-on-surface font-semibold line-clamp-1">{inv.title}</p>
                  <p className="text-body-sm text-on-surface-variant line-clamp-1">{inv.repo}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={clsx('text-label-sm font-mono', inv.reproduced ? 'text-error' : 'text-primary')}>{inv.status}</span>
                    <span className="text-label-sm text-on-surface-variant">{inv.latency}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Workspace panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
            <Icon name="travel_explore" className="text-6xl text-outline-variant" />
            <h2 className="text-headline-md text-on-surface">Select an Investigation</h2>
            <p className="text-body-lg text-on-surface-variant max-w-md">
              Click any investigation on the left to open its workspace. Run the demo workflow: Reproduce → Evidence → Hypothesize.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Investigation header */}
            <div className="px-4 py-3 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 font-mono text-label-sm text-on-surface-variant">
                  <span>Investigation Workspace</span>
                  <span className="text-outline">/</span>
                  <span className="text-primary font-bold">#{selected.issue_number}</span>
                </div>
                <h2 className="text-headline-sm font-bold text-on-surface">{selected.title}</h2>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-label-sm">
                <span className="text-on-surface-variant">Confidence:</span>
                <span className="text-primary font-bold">{Math.round(selected.confidence * 100)}%</span>
                <span className="w-1 h-1 rounded-full bg-primary" />
              </div>
            </div>

            {/* Stage progress bar */}
            <div className="flex items-center bg-surface-container-low border-b border-outline-variant/30 px-4 py-2 gap-2">
              {STAGE_FLOW.map((s, i) => {
                const done = i < stageIndex || (stage === 'done' && i <= stageIndex);
                const active = s.id === stage;
                return (
                  <React.Fragment key={s.id}>
                    {i > 0 && <div className={clsx('h-px flex-1', done ? 'bg-primary' : 'bg-outline-variant/40')} />}
                    <div className={clsx('flex items-center gap-1 text-label-sm font-mono whitespace-nowrap', active ? 'text-primary font-bold' : done ? 'text-tertiary' : 'text-on-surface-variant')}>
                      <Icon name={done && !active ? 'check_circle' : s.icon} className="text-sm" />
                      <span className="hidden lg:inline">{s.label}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden">
              {/* Description + details */}
              <div className="border-r border-outline-variant/30 flex flex-col overflow-y-auto">
                <div className="p-4 flex flex-col gap-3">
                  <div className="text-label-sm uppercase font-mono tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <Icon name="description" className="text-sm text-primary" />
                    Issue Description
                  </div>
                  <p className="text-body-md text-on-surface font-sans leading-relaxed">{selected.description}</p>

                  <div className="grid grid-cols-2 gap-2 font-mono text-body-sm">
                    {[
                      ['Repository', selected.repo, 'primary'],
                      ['Branch', selected.branch, 'primary'],
                      ['Commit', selected.commit, 'secondary'],
                      ['Priority', selected.priority, selected.priority === 'P0-Critical' ? 'error' : 'secondary'],
                      ['Target File', selected.target_file, 'primary'],
                      ['Test File', selected.test_file, 'secondary'],
                    ].map(([k, v, c]) => (
                      <div key={k} className="flex flex-col p-2 bg-surface-container-low border border-outline-variant/20">
                        <span className="text-label-sm uppercase text-on-surface-variant">{k}</span>
                        <span className={clsx('text-label-md truncate', `text-${c}`)}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {hypothesis && (
                    <div className="p-3 bg-secondary-container/10 border border-secondary/30">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon name="lightbulb" className="text-secondary text-base" />
                        <span className="text-label-md font-bold text-secondary uppercase">Root Cause Hypothesis</span>
                        {hypothesis.is_rule_based_fallback && (
                          <span className="text-label-sm px-1 bg-secondary-container/30 text-secondary font-mono">DETERMINISTIC</span>
                        )}
                      </div>
                      <p className="text-body-md text-on-surface font-semibold mb-1">{hypothesis.title}</p>
                      <p className="text-body-sm text-on-surface-variant font-sans">{hypothesis.diagnosis}</p>
                      {hypothesis.disclaimer && (
                        <p className="text-label-sm text-outline mt-2 italic font-sans">{hypothesis.disclaimer}</p>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-error-container/20 border border-error/40 text-error text-body-sm font-mono">
                      Error: {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Terminal + Actions */}
              <div className="flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-3">
                  {output.length > 0 ? (
                    <TerminalOutput lines={output} className="h-full" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-on-surface-variant">
                      <div className="flex flex-col items-center gap-2">
                        <Icon name="terminal" className="text-4xl text-outline-variant" />
                        <span className="text-body-sm">Execute a stage to see output here</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action bar */}
                <div className="p-3 border-t border-outline-variant/30 bg-surface-container-low flex flex-wrap items-center gap-2">
                  <DemoModeBanner />
                  <div className="flex-1" />
                  {stage === 'reproduce' && (
                    <Button id="btn-reproduce" onClick={handleReproduce} loading={stageBusy} variant="error">
                      <Icon name="bug_report" className="text-sm" />
                      Reproduce Bug
                    </Button>
                  )}
                  {stage === 'evidence' && (
                    <Button id="btn-evidence" onClick={handleCollectEvidence} loading={stageBusy} variant="secondary">
                      <Icon name="hub" className="text-sm" />
                      Collect Evidence
                    </Button>
                  )}
                  {stage === 'hypothesize' && (
                    <Button id="btn-hypothesis" onClick={handleHypothesis} loading={stageBusy} variant="primary">
                      <Icon name="psychology" className="text-sm" />
                      Generate Hypothesis
                    </Button>
                  )}
                  {stage === 'done' && (
                    <div className="flex items-center gap-1.5 text-tertiary text-label-sm font-mono">
                      <Icon name="check_circle" className="text-sm" />
                      Hypothesis ready — proceed to Patch Lab
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestigationsPage;
