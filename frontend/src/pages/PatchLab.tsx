import React, { useCallback, useState, useEffect } from 'react';
import { api } from '../api';
import { Icon, Button, Spinner, DiffLine, DemoModeBanner } from '../components/ui';
import { clsx } from 'clsx';

type Tab = 'diff' | 'validate' | 'rationale';

interface Patch {
  diff: string;
  rationale: string;
  confidence: number;
  provider: string;
  is_rule_based_fallback: boolean;
  disclaimer: string;
  files_changed: Array<{ path: string; additions: number; deletions: number }>;
}

interface Validation {
  all_passed: boolean;
  checks_passed: string;
  checklist: Array<{ check: string; passed: boolean; note: string }>;
}

const parseDiff = (diff: string) => {
  const lines: Array<{ type: 'context' | 'add' | 'remove' | 'header'; content: string; oldLine?: number; newLine?: number }> = [];
  let oldN = 0, newN = 0;
  diff.split('\n').forEach(line => {
    if (line.startsWith('@@')) {
      const m = line.match(/@@ -(\d+),\d+ \+(\d+),\d+ @@/);
      if (m) { oldN = parseInt(m[1]) - 1; newN = parseInt(m[2]) - 1; }
      lines.push({ type: 'header', content: line });
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      newN++;
      lines.push({ type: 'add', content: line.slice(1), newLine: newN });
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      oldN++;
      lines.push({ type: 'remove', content: line.slice(1), oldLine: oldN });
    } else if (!line.startsWith('+++') && !line.startsWith('---')) {
      oldN++; newN++;
      lines.push({ type: 'context', content: line.slice(1), oldLine: oldN, newLine: newN });
    }
  });
  return lines;
};

const PatchLabPage: React.FC = () => {
  const [patch, setPatch] = useState<Patch | null>(null);
  const [validation, setValidation] = useState<Validation | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('diff');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issueId] = useState('inv_418_demo');

  const handleProposePatch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setValidation(null);
    try {
      const res = await api.proposePatch(issueId);
      setPatch(res as Patch);
      setActiveTab('diff');
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  const handleValidate = useCallback(async () => {
    if (!patch) return;
    setValidating(true);
    try {
      const res = await api.validatePatch('patch_001', 'demo_repo/src/core/pricing.py', patch.diff);
      setValidation(res as Validation);
      setActiveTab('validate');
    } catch (e) {
      setError(String(e));
    } finally {
      setValidating(false);
    }
  }, [patch]);

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'diff', label: 'Unified Diff', icon: 'diff' },
    { id: 'validate', label: 'Pre-flight Checks', icon: 'checklist' },
    { id: 'rationale', label: 'Rationale', icon: 'psychology' },
  ];

  const diffLines = patch ? parseDiff(patch.diff) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-label-sm uppercase font-mono tracking-widest text-on-surface-variant">Module 04</span>
          <h1 className="text-headline-md font-bold text-on-surface">Patch Lab — Minimal Diff Synthesis</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DemoModeBanner />
          <Button variant="secondary" onClick={handleProposePatch} loading={loading} id="btn-propose-patch">
            <Icon name="auto_fix_high" className="text-sm" />
            Synthesize Patch
          </Button>
          {patch && (
            <Button variant="ghost" onClick={handleValidate} loading={validating} id="btn-validate-patch">
              <Icon name="checklist" className="text-sm" />
              Run Pre-flight Checks
            </Button>
          )}
        </div>
      </div>

      {/* Files changed bar */}
      {patch && (
        <div className="px-4 py-2 bg-surface-container-low border-b border-outline-variant/30 flex items-center gap-3 overflow-x-auto font-mono">
          <span className="text-label-sm text-on-surface-variant uppercase whitespace-nowrap">Files Changed:</span>
          {patch.files_changed.map((f) => (
            <div key={f.path} className="flex items-center gap-1.5 whitespace-nowrap">
              <Icon name="edit_document" className="text-sm text-primary" />
              <span className="text-label-md text-on-surface">{f.path}</span>
              <span className="text-label-sm text-tertiary">+{f.additions}</span>
              <span className="text-label-sm text-error">−{f.deletions}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-label-sm text-on-surface-variant">Confidence:</span>
            <span className="text-label-md text-primary font-bold">{Math.round(patch.confidence * 100)}%</span>
          </div>
        </div>
      )}

      {/* Tab bar */}
      {patch && (
        <div className="flex items-center bg-surface-container-lowest border-b border-outline-variant/30 px-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2.5 text-label-md font-mono uppercase border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              )}
            >
              <Icon name={tab.icon} className="text-sm" />
              {tab.label}
              {tab.id === 'validate' && validation && (
                <span className={clsx('text-label-sm px-1', validation.all_passed ? 'bg-tertiary-container/30 text-tertiary' : 'bg-error-container/30 text-error')}>
                  {validation.all_passed ? 'PASS' : 'ISSUES'}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {error && (
          <div className="m-4 p-3 bg-error-container/20 border border-error/40 text-error text-body-sm font-mono">{error}</div>
        )}

        {!patch && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <div className="p-4 bg-surface-container-low border border-outline-variant/30 text-center max-w-md">
              <Icon name="build" className="text-5xl text-outline-variant mb-3" />
              <h2 className="text-headline-sm font-bold text-on-surface mb-2">No Patch Synthesized Yet</h2>
              <p className="text-body-md text-on-surface-variant font-sans mb-4">
                Click "Synthesize Patch" to generate a minimal, mathematically-verified diff for Issue #418.
              </p>
              <Button variant="primary" onClick={handleProposePatch} id="btn-propose-patch-empty">
                <Icon name="auto_fix_high" className="text-sm" />
                Synthesize Patch Now
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full gap-2">
            <Spinner className="text-2xl" />
            <span className="text-on-surface-variant font-mono text-body-md">Synthesizing minimal patch…</span>
          </div>
        )}

        {patch && activeTab === 'diff' && (
          <div className="flex-1 overflow-y-auto bg-surface-container-lowest">
            <div className="flex items-center justify-between px-4 py-2 bg-surface-container-low border-b border-outline-variant/20 font-mono">
              <span className="text-label-sm text-on-surface-variant">Provider: <span className="text-primary">{patch.provider}</span></span>
              {patch.is_rule_based_fallback && (
                <span className="text-label-sm text-secondary px-1 bg-secondary-container/20 border border-secondary/30">DEMO — Deterministic Fallback</span>
              )}
            </div>
            <div className="overflow-x-auto">
              {diffLines.map((dl, i) =>
                dl.type === 'header' ? (
                  <div key={i} className="px-4 py-1 bg-surface-container font-mono text-label-sm text-on-surface-variant border-b border-outline-variant/10">
                    {dl.content}
                  </div>
                ) : (
                  <DiffLine key={i} type={dl.type} content={dl.content} oldLine={dl.oldLine} newLine={dl.newLine} />
                )
              )}
            </div>
            {patch.disclaimer && (
              <div className="m-4 p-3 border border-outline-variant/40 bg-surface-container-low text-label-sm text-on-surface-variant font-sans italic">
                ⚠ {patch.disclaimer}
              </div>
            )}
          </div>
        )}

        {patch && activeTab === 'validate' && (
          <div className="flex-1 overflow-y-auto p-4">
            {!validation && !validating ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Icon name="checklist" className="text-5xl text-outline-variant" />
                <Button variant="ghost" onClick={handleValidate} id="btn-validate-center">
                  <Icon name="play_arrow" className="text-sm text-primary" />
                  Run Pre-flight Checks
                </Button>
              </div>
            ) : validating ? (
              <div className="flex items-center justify-center h-full gap-2">
                <Spinner className="text-xl" />
                <span className="text-on-surface-variant font-mono text-body-md">Running checks…</span>
              </div>
            ) : validation ? (
              <div className="space-y-3 max-w-2xl">
                <div className={clsx('p-3 border flex items-center gap-2', validation.all_passed ? 'bg-tertiary-container/20 border-tertiary/40' : 'bg-error-container/20 border-error/40')}>
                  <Icon name={validation.all_passed ? 'check_circle' : 'error'} className={clsx('text-xl', validation.all_passed ? 'text-tertiary' : 'text-error')} />
                  <div className="flex flex-col">
                    <span className={clsx('text-label-md font-bold font-mono uppercase', validation.all_passed ? 'text-tertiary' : 'text-error')}>
                      {validation.all_passed ? 'All Pre-flight Checks Passed' : 'Pre-flight Issues Detected'}
                    </span>
                    <span className="text-body-sm text-on-surface-variant">{validation.checks_passed}</span>
                  </div>
                </div>
                {(validation.checklist as Array<{ check: string; passed: boolean; note: string }>).map((c, i) => (
                  <div key={i} className={clsx('p-2 border flex items-start gap-2', c.passed ? 'border-outline-variant/30' : 'border-error/30 bg-error-container/10')}>
                    <Icon name={c.passed ? 'check_circle' : 'cancel'} className={clsx('text-base mt-0.5', c.passed ? 'text-tertiary' : 'text-error')} />
                    <div className="flex flex-col">
                      <span className="text-label-md font-bold text-on-surface font-mono">{c.check}</span>
                      <span className="text-body-sm text-on-surface-variant">{c.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {patch && activeTab === 'rationale' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-2xl space-y-3">
              <div className="p-3 bg-surface-container-low border border-outline-variant/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon name="psychology" className="text-secondary text-sm" />
                  <span className="text-label-md font-bold text-secondary uppercase font-mono">Patch Rationale</span>
                </div>
                <p className="text-body-md text-on-surface font-sans leading-relaxed">{patch.rationale}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatchLabPage;
