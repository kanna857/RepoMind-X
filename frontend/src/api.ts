// API client for RepoMind X backend
const API_BASE = '/api';

export type Investigation = {
  id: string;
  title: string;
  issue_number: number;
  repo: string;
  repo_id: string;
  priority: string;
  status: string;
  latency: string;
  branch: string;
  commit: string;
  target_file: string;
  test_file: string;
  description: string;
  confidence: number;
  evidence_markers: string[];
  lifecycle_stage: number;
  reproduced: boolean;
};

export type Repository = {
  id: string;
  name: string;
  status: string;
  indexing_progress: number;
  ast_nodes: number;
  test_coverage: number;
  branch: string;
  commit: string;
  description: string;
  is_local_demo: boolean;
};

export type VerificationRecord = {
  id: string;
  record_id: string;
  timestamp: string;
  success: boolean;
  exit_code: number;
  duration_seconds: number;
  patch_applied: boolean;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  stdout: string;
  stderr: string;
  sha256_audit_digest: string;
  sandbox_id: string;
  coverage: string;
  memory_peak: string;
  environment: string;
  regression_status: string;
};

export type HealthResponse = {
  status: string;
  app_name: string;
  version: string;
  ai_provider: string;
  is_rule_based_fallback: boolean;
  zero_outbound_telemetry: boolean;
  sandbox_isolation: string;
  demo_repo_available: boolean;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getHealth: () => request<HealthResponse>('/health'),
  getRepositories: () => request<Repository[]>('/repositories'),
  getRepoTree: (repoId: string) => request<{ id: string; tree: unknown[] }>(`/repositories/${repoId}/tree`),
  getRepoFile: (repoId: string, path: string) =>
    request<{ content: string; line_count: number; ast_nodes: number; path: string }>(
      `/repositories/${repoId}/file?path=${encodeURIComponent(path)}`
    ),
  searchRepo: (repoId: string, q: string) =>
    request<{ results: Array<{ path: string; line: number; type: string; text: string }> }>(
      `/repositories/${repoId}/search?q=${encodeURIComponent(q)}`
    ),
  getInvestigations: () => request<Investigation[]>('/investigations'),
  getInvestigation: (id: string) => request<Investigation>(`/investigations/${id}`),
  reproduceBug: (id: string) =>
    request<{ reproduced: boolean; passed_tests: number; failed_tests: number; stdout: string }>(
      `/investigations/${id}/reproduce`,
      { method: 'POST', body: JSON.stringify({}) }
    ),
  collectEvidence: (id: string) =>
    request<{ evidence: unknown[] }>(`/investigations/${id}/evidence`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  generateHypothesis: (id: string) =>
    request<{ title: string; confidence: number; diagnosis: string; is_rule_based_fallback: boolean; disclaimer: string }>(
      `/investigations/${id}/hypothesize`,
      { method: 'POST', body: JSON.stringify({}) }
    ),
  proposePatch: (issueId: string) =>
    request<{
      diff: string;
      rationale: string;
      confidence: number;
      provider: string;
      is_rule_based_fallback: boolean;
      disclaimer: string;
      files_changed: Array<{ path: string; additions: number; deletions: number }>;
    }>('/patches/propose', {
      method: 'POST',
      body: JSON.stringify({ issue_id: issueId }),
    }),
  validatePatch: (patchId: string, targetFile: string, diff: string) =>
    request<{ all_passed: boolean; checks_passed: string; checklist: unknown[] }>('/patches/validate', {
      method: 'POST',
      body: JSON.stringify({ patch_id: patchId, target_file: targetFile, diff }),
    }),
  runSandbox: (applyPatch: boolean) =>
    request<VerificationRecord>('/verification/run-sandbox', {
      method: 'POST',
      body: JSON.stringify({ apply_patch: applyPatch }),
    }),
  getVerificationRecords: () => request<VerificationRecord[]>('/verification/records'),
  dispatchPR: () =>
    request<{ pr_number: number; pr_url: string; status: string }>('/verification/dispatch-pr', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  getSettings: () => request<Record<string, unknown>>('/settings'),
  updateSettings: (data: Record<string, unknown>) =>
    request<{ status: string; ai_provider: string }>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
