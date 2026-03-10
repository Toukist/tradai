import { useState } from 'react';
import DebateModule from './components/DebateModule.jsx';
import PortfolioModule from './components/PortfolioModule.jsx';

const TABS = [
  { id: 'debate',    label: 'Débat IA' },
  { id: 'portfolio', label: 'Analyse Portefeuille' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('debate');

  return (
    <div className="min-h-screen" style={{ background: '#080A0E' }}>
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Trad<span style={{ color: '#C9A96E' }}>AI</span>
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              5 IA. 1 synthèse. La meilleure décision.
            </p>
          </div>

          {/* Tabs */}
          <nav className="flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white ring-1 ring-white/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'debate'    && <DebateModule />}
        {activeTab === 'portfolio' && <PortfolioModule />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-4 mt-12">
        <p className="text-center text-xs text-gray-600">
          TradAI fournit des pistes de réflexion uniquement. Ne constitue pas un conseil en
          investissement au sens de MiFID II. Consultez un conseiller financier agréé avant
          toute décision d'investissement.
        </p>
      </footer>
    </div>
  );
}
