import React, { useCallback, useState } from 'react';
import { api } from '../api';
import { Icon, Button, Spinner, TerminalOutput, DemoModeBanner } from '../components/ui';
import { clsx } from 'clsx';

type RunResult = {
  id: string;
  success: boolean;
  exit_code: number;
  duration_seconds: number;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  stdout: string;
  sha256_audit_digest: string;
  sandbox_id: string;
  coverage: string;
  memory_peak: string;
  environment: string;
  regression_status: string;
  patch_applied: boolean;
};

const VerificationPage: React.FC = () => {
  const [baselineRun, setBaselineRun] = useState<RunResult | null>(null);
  const [patchedRun, setPatchedRun] = useState<RunResult | null>(null);
  const [loading, setLoading] = useState<'baseline' | 'patched' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prDispatched, setPrDispatched] = useState<{ pr_number: number; pr_url: string; status: string } | null>(null);

  const runSandbox = useCallback(async (applyPatch: boolean) => {
    setLoading(applyPatch ? 'patched' : 'baseline');
    setError(null);
    try {
      const res = await api.runSandbox(applyPatch);
      if (applyPatch) setPatchedRun(res as RunResult);
      else setBaselineRun(res as RunResult);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(null);
    }
  }, []);

  const handleDispatchPR = useCallback(async () => {
    try {
      const res = await api.dispatchPR();
      setPrDispatched(res);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  const RunPanel: React.FC<{ title: string; run: RunResult | null; busy: boolean; onRun: () => void; btnLabel: string; btnId: string; patchApplied: boolean }> =
    ({ title, run, busy, onRun, btnLabel, btnId, patchApplied }) => (
      <div className="flex flex-col border border-outline-variant/30 bg-surface-container-lowest">
        <div className="h-9 px-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {run && (
              <span className={clsx('w-2 h-2 rounded-none', run.success ? 'bg-tertiary' : 'bg-error')} />
            )}
            <span className="text-label-md font-mono font-bold text-on-surface uppercase">{title}</span>
            {patchApplied && (
              <span className="text-label-sm px-1 bg-secondary-container/20 text-secondary border border-secondary/30 font-mono">+PATCH</span>
            )}
          </div>
          <Button onClick={onRun} loading={busy} variant={patchApplied ? 'primary' : 'ghost'} id={btnId} disabled={busy}>
            <Icon name="play_circle" className="text-sm" />
            {btnLabel}
          </Button>
        </div>

        {busy && (
          <div className="flex items-center justify-center p-8 gap-2">
            <Spinner className="text-xl" />
            <span className="text-on-surface-variant font-mono text-body-sm">Spawning ephemeral sandbox…</span>
          </div>
        )}

        {!busy && run && (
          <div className="flex flex-col">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-outline-variant/20">
              {[
                { k: 'Tests Passed', v: `${run.passed_tests}/${run.total_tests}`, color: run.failed_tests === 0 ? 'text-tertiary' : 'text-error' },
                { k: 'Duration', v: `${run.duration_seconds.toFixed(2)}s`, color: 'text-primary' },
                { k: 'Coverage', v: run.coverage, color: 'text-secondary' },
                { k: 'Exit Code', v: `${run.exit_code}`, color: run.exit_code === 0 ? 'text-tertiary' : 'text-error' },
              ].map((m) => (
                <div key={m.k} className="flex flex-col p-2 border-r border-outline-variant/10 last:border-r-0">
                  <span className="text-label-sm text-on-surface-variant font-mono uppercase">{m.k}</span>
                  <span className={clsx('text-headline-sm font-bold font-mono', m.color)}>{m.v}</span>
                </div>
              ))}
            </div>

            {/* Extra info */}
            <div className="grid grid-cols-2 gap-2 p-2 border-b border-outline-variant/20 font-mono">
              {[
                { k: 'Regression Status', v: run.regression_status, color: run.success ? 'text-tertiary' : 'text-error' },
                { k: 'Sandbox ID', v: run.sandbox_id, color: 'text-on-surface-variant' },
                { k: 'Memory Peak', v: run.memory_peak, color: 'text-on-surface-variant' },
                { k: 'Environment', v: run.environment, color: 'text-on-surface-variant' },
              ].map((m) => (
                <div key={m.k} className="flex flex-col p-1.5 bg-surface-container-low border border-outline-variant/10">
                  <span className="text-label-sm text-on-surface-variant uppercase">{m.k}</span>
                  <span className={clsx('text-body-sm truncate', m.color)}>{m.v}</span>
                </div>
              ))}
            </div>

            {/* Terminal output */}
            <TerminalOutput lines={run.stdout.split('\n').slice(0, 30)} className="max-h-48" />

            {/* SHA audit */}
            <div className="px-3 py-1.5 border-t border-outline-variant/20 flex items-center gap-2 font-mono">
              <Icon name="fingerprint" className="text-sm text-secondary" />
              <span className="text-label-sm text-on-surface-variant">SHA-256:</span>
              <span className="text-label-sm text-secondary font-mono">{run.sha256_audit_digest}</span>
            </div>
          </div>
        )}

        {!busy && !run && (
          <div className="flex flex-col items-center justify-center p-8 gap-2 text-center">
            <Icon name="terminal" className="text-4xl text-outline-variant" />
            <span className="text-body-sm text-on-surface-variant">Click "{btnLabel}" to spawn an isolated sandbox</span>
          </div>
        )}
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-label-sm uppercase font-mono tracking-widest text-on-surface-variant">Module 05–06</span>
          <h1 className="text-headline-md font-bold text-on-surface">Verification Center — Sandbox Execution</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DemoModeBanner />
          {patchedRun?.success && (
            <Button variant="primary" onClick={handleDispatchPR} id="btn-dispatch-pr">
              <Icon name="merge_type" className="text-sm" />
              Dispatch Pull Request
            </Button>
          )}
        </div>
      </div>

      {/* PR dispatched banner */}
      {prDispatched && (
        <div className="mx-4 mt-4 p-3 bg-tertiary-container/20 border border-tertiary/40 flex items-center gap-2">
          <Icon name="check_circle" className="text-tertiary text-lg" />
          <span className="text-body-md text-tertiary font-mono">
            Pull Request #{prDispatched.pr_number} dispatched — {prDispatched.status}
          </span>
          <a href={prDispatched.pr_url} target="_blank" rel="noreferrer" className="ml-auto text-label-sm text-primary hover:underline font-mono">
            {prDispatched.pr_url}
          </a>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-4 p-3 bg-error-container/20 border border-error/40 text-error text-body-sm font-mono">{error}</div>
      )}

      {/* Comparison grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 xl:grid-cols-2 gap-4 content-start">
        <RunPanel
          title="Baseline Run (Bug Reproduced)"
          run={baselineRun}
          busy={loading === 'baseline'}
          onRun={() => runSandbox(false)}
          btnLabel="Run Baseline"
          btnId="btn-run-baseline"
          patchApplied={false}
        />
        <RunPanel
          title="Patched Run (Regression Check)"
          run={patchedRun}
          busy={loading === 'patched'}
          onRun={() => runSandbox(true)}
          btnLabel="Run With Patch"
          btnId="btn-run-patched"
          patchApplied={true}
        />
      </div>

      {/* Footer instructions */}
      <div className="py-2 px-4 border-t border-outline-variant/30 bg-surface-container-lowest flex items-center gap-2 font-mono">
        <Icon name="info" className="text-sm text-secondary" />
        <span className="text-label-sm text-on-surface-variant">
          Sandboxes run in ephemeral temp directories. Patches are applied to a temporary copy only — no production files are modified.
        </span>
      </div>
    </div>
  );
};

export default VerificationPage;
