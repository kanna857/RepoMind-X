import React, { useEffect, useState, useCallback } from 'react';
import { api, Repository } from '../api';
import { Icon, Spinner, Button } from '../components/ui';
import { clsx } from 'clsx';

type TreeNode = { name: string; type: 'file' | 'dir'; path: string; children?: TreeNode[] };

const FileIcon: React.FC<{ name: string }> = ({ name }) => {
  const ext = name.split('.').pop() ?? '';
  const map: Record<string, string> = {
    py: 'text-secondary',
    ts: 'text-primary',
    tsx: 'text-primary',
    js: 'text-tertiary',
    json: 'text-outline',
    md: 'text-on-surface-variant',
    toml: 'text-secondary',
    txt: 'text-on-surface-variant',
  };
  return <Icon name="description" className={clsx('text-sm', map[ext] ?? 'text-on-surface-variant')} />;
};

const TreeItem: React.FC<{ node: TreeNode; depth: number; onSelectFile: (path: string) => void; selectedPath: string | null }> = ({ node, depth, onSelectFile, selectedPath }) => {
  const [open, setOpen] = useState(depth < 2);
  const isSelected = node.path === selectedPath;
  const isDir = node.type === 'dir';
  return (
    <div>
      <button
        onClick={() => {
          if (isDir) setOpen(!open);
          else onSelectFile(node.path);
        }}
        className={clsx(
          'flex items-center gap-1.5 py-0.5 w-full text-left hover:bg-surface-container-high transition-colors text-body-sm font-mono',
          isSelected ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant',
        )}
        style={{ paddingLeft: `${0.5 + depth * 1}rem` }}
      >
        {isDir ? (
          <Icon name={open ? 'folder_open' : 'folder'} className="text-sm text-primary" />
        ) : (
          <FileIcon name={node.name} />
        )}
        <span className={clsx('truncate text-body-sm', isDir ? 'font-semibold text-on-surface' : '', isSelected ? 'text-primary' : '')}>{node.name}</span>
      </button>
      {isDir && open && node.children?.map((child) => (
        <TreeItem key={child.path} node={child} depth={depth + 1} onSelectFile={onSelectFile} selectedPath={selectedPath} />
      ))}
    </div>
  );
};

const RepositoriesPage: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [tree, setTree] = useState<TreeNode[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<{ content: string; line_count: number; ast_nodes: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileLoading, setFileLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ path: string; line: number; type: string; text: string }> | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.getRepositories().then(repos => {
      setRepositories(repos);
      const demo = repos.find(r => r.is_local_demo) ?? repos[0];
      if (demo) selectRepo(demo);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const selectRepo = useCallback(async (repo: Repository) => {
    setSelectedRepo(repo);
    setTree(null);
    setSelectedFile(null);
    setFileContent(null);
    setSearchResults(null);
    try {
      const res = await api.getRepoTree(repo.id);
      setTree(res.tree as TreeNode[]);
    } catch (e) { console.error(e); }
  }, []);

  const openFile = useCallback(async (path: string) => {
    if (!selectedRepo) return;
    setSelectedFile(path);
    setFileLoading(true);
    try {
      const res = await api.getRepoFile(selectedRepo.id, path);
      setFileContent(res);
    } catch (e) { console.error(e); }
    finally { setFileLoading(false); }
  }, [selectedRepo]);

  const runSearch = useCallback(async () => {
    if (!selectedRepo || !searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.searchRepo(selectedRepo.id, searchQuery);
      setSearchResults(res.results);
    } catch (e) { console.error(e); }
    finally { setSearching(false); }
  }, [selectedRepo, searchQuery]);

  return (
    <div className="flex h-full w-full">
      {/* Repo List */}
      <div className="w-52 flex-none border-r border-outline-variant/30 bg-surface-container-lowest flex flex-col">
        <div className="h-10 px-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center gap-1.5">
          <Icon name="folder_data" className="text-sm text-primary" />
          <span className="text-label-md uppercase font-mono font-bold text-on-surface">Repositories</span>
        </div>
        {loading ? <Spinner className="m-4" /> : (
          <div className="overflow-y-auto flex-1">
            {repositories.map((repo) => (
              <button key={repo.id} onClick={() => selectRepo(repo)}
                className={clsx('w-full text-left p-2 border-b border-outline-variant/20 transition-colors hover:bg-surface-container-high',
                  selectedRepo?.id === repo.id ? 'bg-surface-container-high border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                )}>
                <div className="flex items-center gap-1.5">
                  <span className={clsx('w-1.5 h-1.5 rounded-full', repo.status === 'ONLINE' ? 'bg-tertiary' : 'bg-primary animate-pulse')} />
                  <span className="text-label-md font-mono font-bold text-on-surface truncate">{repo.name}</span>
                </div>
                <div className="text-body-sm text-on-surface-variant mt-0.5">{repo.status}</div>
                {repo.is_local_demo && <span className="text-label-sm text-secondary font-mono">DEMO</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* File Tree */}
      <div className="w-60 flex-none border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest">
        <div className="h-10 px-2 bg-surface-container-low border-b border-outline-variant/30 flex items-center gap-1.5">
          <Icon name="account_tree" className="text-sm text-primary" />
          <span className="text-label-sm font-mono font-bold text-on-surface uppercase">File Explorer</span>
        </div>
        {!tree ? (
          <div className="flex items-center justify-center p-6"><Spinner /></div>
        ) : (
          <div className="overflow-y-auto flex-1 py-1">
            {tree.map((node) => (
              <TreeItem key={node.path} node={node} depth={0} onSelectFile={openFile} selectedPath={selectedFile} />
            ))}
          </div>
        )}
      </div>

      {/* File Content Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search bar */}
        <div className="px-3 py-2 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runSearch()}
            placeholder="Search symbols, functions, strings in repo…"
            className="flex-1 bg-surface-container-low border border-outline-variant/30 px-2 py-1 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
          />
          <Button onClick={runSearch} loading={searching} variant="ghost" id="btn-repo-search">
            <Icon name="search" className="text-sm text-primary" />Search
          </Button>
          {searchResults && (
            <Button onClick={() => setSearchResults(null)} variant="ghost">
              <Icon name="close" className="text-sm" />
            </Button>
          )}
        </div>

        {/* File path bar */}
        {selectedFile && !searchResults && (
          <div className="px-3 py-1.5 bg-surface-container-low border-b border-outline-variant/20 flex items-center gap-2 font-mono">
            <Icon name="description" className="text-sm text-primary" />
            <span className="text-label-md text-on-surface">{selectedFile}</span>
            {fileContent && (
              <>
                <span className="text-outline-variant">·</span>
                <span className="text-label-sm text-on-surface-variant">{fileContent.line_count} lines</span>
                <span className="text-outline-variant">·</span>
                <span className="text-label-sm text-secondary">{fileContent.ast_nodes} AST nodes</span>
              </>
            )}
          </div>
        )}

        {/* Search results */}
        {searchResults && (
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-label-sm font-mono text-on-surface-variant mb-2">{searchResults.length} results for "{searchQuery}"</div>
            {searchResults.map((r, i) => (
              <button key={i} onClick={() => { openFile(r.path); setSearchResults(null); }}
                className="w-full text-left p-2 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 mb-1 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-label-sm text-primary">{r.path}</span>
                  <span className="text-label-sm text-on-surface-variant">:{r.line}</span>
                  <span className="text-label-sm px-1 bg-surface-container text-on-surface-variant">{r.type}</span>
                </div>
                <div className="text-body-sm text-on-surface">{r.text}</div>
              </button>
            ))}
          </div>
        )}

        {/* File content */}
        {!searchResults && (
          <div className="flex-1 overflow-auto bg-surface-container-lowest">
            {fileLoading ? (
              <div className="flex items-center justify-center h-full"><Spinner className="text-2xl" /></div>
            ) : fileContent ? (
              <div className="font-mono text-[11px] leading-5">
                {fileContent.content.split('\n').map((line, i) => (
                  <div key={i} className={clsx(
                    'flex hover:bg-surface-container/40 transition-colors',
                    (i + 1) === 20 ? 'bg-error-container/20 border-l-2 border-error' : ''
                  )}>
                    <span className="w-10 flex-none text-right pr-3 py-0.5 text-outline select-none border-r border-outline-variant/20">
                      {i + 1}
                    </span>
                    <span className={clsx('px-3 py-0.5 whitespace-pre flex-1 text-on-surface-variant',
                      line.includes('def ') ? 'text-primary' :
                      line.includes('return') ? 'text-secondary' :
                      line.includes('#') ? 'text-outline' :
                      line.includes('import') ? 'text-tertiary' : ''
                    )}>
                      {line || ' '}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Icon name="code" className="text-5xl text-outline-variant" />
                <p className="text-body-md text-on-surface-variant">Select a file from the explorer</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoriesPage;
