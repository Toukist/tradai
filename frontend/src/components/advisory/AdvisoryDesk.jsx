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
  const isAllIn = user?.plan === 'team';

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden">
        <div className="bg-[linear-gradient(135deg,rgba(110,201,169,0.18),rgba(8,10,14,0.95))] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-[#6EC9A9]/40 bg-[#6EC9A9]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9FE5CF]">
                {isAllIn ? 'Roadmap All In' : 'Exclusivité Advisory All In à venir'}
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-white">Prompts experts Advisory</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#D1EADF]">
                Nous préparons la même logique de scénarios guidés pour Advisory Desk : comparaison ETF, lecture patrimoniale long terme, analyse de portefeuille et optimisation de switch.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0B1412]/80 px-4 py-3 text-sm text-[#D7EEE5] lg:max-w-sm">
              {isAllIn
                ? 'Ton plan All In te réservera automatiquement ces futurs prompts experts dès leur activation côté Advisory.'
                : 'Les presets Advisory seront réservés à All In. Les modules actuels restent disponibles selon ton plan, mais les scénarios guidés feront partie de l’offre premium.'}
            </div>
          </div>
        </div>
      </section>

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
