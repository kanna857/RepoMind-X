import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { Icon, Button, Spinner, DemoModeBanner } from '../components/ui';
import { clsx } from 'clsx';

type ProviderKey = 'deterministic' | 'ollama' | 'custom';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [provider, setProvider] = useState<ProviderKey>('deterministic');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('codellama:13b');
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');

  useEffect(() => {
    api.getSettings().then(s => {
      setSettings(s);
      if (s.ai_provider) setProvider(s.ai_provider as ProviderKey);
      if (s.ollama_url) setOllamaUrl(s.ollama_url as string);
      if (s.ollama_model) setOllamaModel(s.ollama_model as string);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await api.updateSettings({
        ai_provider: provider,
        ollama_url: ollamaUrl,
        ollama_model: ollamaModel,
        custom_endpoint_url: customUrl,
        custom_api_key: customKey || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }, [provider, ollamaUrl, ollamaModel, customUrl, customKey]);

  const PROVIDERS: { id: ProviderKey; label: string; sub: string; icon: string }[] = [
    { id: 'deterministic', label: 'Demo Mode (Deterministic)', sub: 'No API key required. Heuristic rule-based engine for hackathon demos.', icon: 'science' },
    { id: 'ollama', label: 'Local Ollama (Open-Weight)', sub: 'Run CodeLlama, Qwen, or Deepseek-Coder locally via Ollama.', icon: 'computer' },
    { id: 'custom', label: 'Custom OpenAI-Compatible Endpoint', sub: 'Use any OpenAI-compatible API endpoint with your own key.', icon: 'api' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-label-sm uppercase font-mono tracking-widest text-on-surface-variant">Configuration</span>
          <h1 className="text-headline-md font-bold text-on-surface">Settings — AI Provider & Security</h1>
        </div>
        <div className="flex items-center gap-2">
          {provider === 'deterministic' && <DemoModeBanner />}
          <Button onClick={handleSave} loading={saving} variant={saved ? 'ghost' : 'primary'} id="btn-save-settings">
            <Icon name={saved ? 'check_circle' : 'save'} className="text-sm" />
            {saved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-full"><Spinner className="text-2xl" /></div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl space-y-6">
            {/* Provider selector */}
            <div className="flex flex-col gap-2">
              <h2 className="text-label-lg uppercase font-mono font-bold text-on-surface tracking-wider flex items-center gap-1.5">
                <Icon name="smart_toy" className="text-base text-primary" />
                AI Model Provider
              </h2>
              <div className="space-y-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={clsx(
                      'w-full text-left flex items-start gap-3 p-3 border transition-colors',
                      provider === p.id
                        ? 'bg-surface-container-high border-primary/60'
                        : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant/60'
                    )}
                  >
                    <div className={clsx('mt-0.5 w-4 h-4 border-2 flex items-center justify-center flex-none', provider === p.id ? 'border-primary bg-primary/20' : 'border-outline-variant/60')}>
                      {provider === p.id && <span className="w-2 h-2 bg-primary" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <Icon name={p.icon} className="text-sm text-primary" />
                        <span className="text-label-md font-bold text-on-surface font-mono">{p.label}</span>
                        {p.id === 'deterministic' && (
                          <span className="text-label-sm px-1 bg-secondary-container/30 text-secondary border border-secondary/40 font-mono">No API Key</span>
                        )}
                      </div>
                      <span className="text-body-sm text-on-surface-variant">{p.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ollama config */}
            {provider === 'ollama' && (
              <div className="flex flex-col gap-3 p-3 bg-surface-container-low border border-outline-variant/30">
                <h3 className="text-label-md font-bold font-mono text-on-surface uppercase">Ollama Configuration</h3>
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-on-surface-variant font-mono uppercase">Ollama Base URL</span>
                  <input
                    value={ollamaUrl}
                    onChange={e => setOllamaUrl(e.target.value)}
                    className="bg-surface-container-lowest border border-outline-variant/40 px-2 py-1.5 text-body-md text-on-surface font-mono focus:outline-none focus:border-primary"
                    placeholder="http://localhost:11434"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-on-surface-variant font-mono uppercase">Model Name</span>
                  <input
                    value={ollamaModel}
                    onChange={e => setOllamaModel(e.target.value)}
                    className="bg-surface-container-lowest border border-outline-variant/40 px-2 py-1.5 text-body-md text-on-surface font-mono focus:outline-none focus:border-primary"
                    placeholder="codellama:13b"
                  />
                </label>
                <p className="text-body-sm text-on-surface-variant">
                  Recommended models: <span className="text-primary font-mono">codellama:13b</span>,{' '}
                  <span className="text-primary font-mono">qwen2.5-coder:7b</span>,{' '}
                  <span className="text-primary font-mono">deepseek-coder:6.7b</span>
                </p>
              </div>
            )}

            {/* Custom endpoint config */}
            {provider === 'custom' && (
              <div className="flex flex-col gap-3 p-3 bg-surface-container-low border border-outline-variant/30">
                <h3 className="text-label-md font-bold font-mono text-on-surface uppercase">Custom OpenAI-Compatible Endpoint</h3>
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-on-surface-variant font-mono uppercase">API Base URL</span>
                  <input
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    className="bg-surface-container-lowest border border-outline-variant/40 px-2 py-1.5 text-body-md text-on-surface font-mono focus:outline-none focus:border-primary"
                    placeholder="https://api.openai.com/v1"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm text-on-surface-variant font-mono uppercase">API Key</span>
                  <input
                    type="password"
                    value={customKey}
                    onChange={e => setCustomKey(e.target.value)}
                    className="bg-surface-container-lowest border border-outline-variant/40 px-2 py-1.5 text-body-md text-on-surface font-mono focus:outline-none focus:border-primary"
                    placeholder="sk-…"
                  />
                </label>
                <p className="text-body-sm text-on-surface-variant italic">
                  API keys are stored in-memory only. Never written to disk or transmitted externally.
                </p>
              </div>
            )}

            {/* Security info */}
            <div className="flex flex-col gap-2">
              <h2 className="text-label-lg uppercase font-mono font-bold text-on-surface tracking-wider flex items-center gap-1.5">
                <Icon name="security" className="text-base text-tertiary" />
                Security Configuration
              </h2>
              <div className="space-y-1.5 font-mono">
                {[
                  { label: 'Zero Outbound Telemetry', value: String(settings?.zero_outbound_telemetry ?? true), ok: true },
                  { label: 'Sandbox Isolation', value: 'ephemeral_directory', ok: true },
                  { label: 'Path Traversal Protection', value: 'Enabled (validate_safe_path)', ok: true },
                  { label: 'Max File Size', value: `${((settings?.max_file_size_bytes as number ?? 1048576) / 1024).toFixed(0)} KB`, ok: true },
                  { label: 'Subprocess Timeout', value: `${settings?.subprocess_timeout_seconds ?? 30}s`, ok: true },
                  { label: 'Allowlisted Commands', value: (settings?.allowlisted_commands as string[] ?? []).join(', '), ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2 bg-surface-container-low border border-outline-variant/20">
                    <span className="text-label-md text-on-surface">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      {item.ok && <Icon name="check_circle" className="text-sm text-tertiary" />}
                      <span className="text-label-sm text-tertiary font-mono truncate max-w-40">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
