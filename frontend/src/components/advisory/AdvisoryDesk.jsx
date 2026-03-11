import { useState } from 'react';
import ETFAnalysis from './ETFAnalysis';
import FundAnalysis from './FundAnalysis';
import PortfolioAnalysis from './PortfolioAnalysis';
import SwitchOptimizer from './SwitchOptimizer';

const TABS = [
  { id: 'etf', label: 'ETF Analysis' },
  { id: 'funds', label: 'Fund Analysis' },
  { id: 'portfolio', label: 'Portfolio Analysis' },
  { id: 'switch', label: 'Switch Optimizer' },
];

export default function AdvisoryDesk({ user, token }) {
  const [activeTab, setActiveTab] = useState('etf');

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-wrap gap-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'border-[#6EC9A9] bg-[#6EC9A9]/10 text-[#6EC9A9]'
                  : 'border-white/10 text-[#9EA4AF] hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'etf' && <ETFAnalysis user={user} token={token} />}
      {activeTab === 'funds' && <FundAnalysis user={user} token={token} />}
      {activeTab === 'portfolio' && <PortfolioAnalysis user={user} token={token} />}
      {activeTab === 'switch' && <SwitchOptimizer user={user} token={token} />}
    </div>
  );
}
