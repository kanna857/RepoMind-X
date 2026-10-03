import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewPage from './pages/Overview';
import InvestigationsPage from './pages/Investigations';
import PatchLabPage from './pages/PatchLab';
import VerificationPage from './pages/Verification';
import RepositoriesPage from './pages/Repositories';
import SettingsPage from './pages/Settings';

type Page = 'overview' | 'investigations' | 'patch-lab' | 'verification' | 'repositories' | 'settings';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('overview');
  const [isDemoMode] = useState(true);

  const renderPage = () => {
    switch (activePage) {
      case 'overview': return <OverviewPage onNavigate={(p) => setActivePage(p as Page)} />;
      case 'investigations': return <InvestigationsPage />;
      case 'patch-lab': return <PatchLabPage />;
      case 'verification': return <VerificationPage />;
      case 'repositories': return <RepositoriesPage />;
      case 'settings': return <SettingsPage />;
    }
  };

  return (
    <div className="flex bg-surface-container-lowest min-h-screen">
      <Sidebar activePage={activePage} onNavigate={setActivePage} isDemoMode={isDemoMode} />
      <div className="flex flex-col ml-72 flex-1 min-h-screen">
        <Header />
        <main className="flex flex-col flex-1 mt-14 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
