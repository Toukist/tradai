import { useState } from 'react';
import GlobalMarket from './GlobalMarket';
import NasdaqMarket from './NasdaqMarket';
import EuropeanMarket from './EuropeanMarket';

const MARKETS = [
  { id: 'global', label: '🌍 Marché Mondial', models: ['Claude', 'Gemini', 'GPT'] },
  { id: 'nasdaq', label: '📈 Nasdaq / US', models: ['Grok', 'GPT', 'Claude'] },
  { id: 'european', label: '🇪🇺 Marché EU', models: ['Mistral', 'Claude', 'Gemini'] },
];

export default function TradingDesk({ user, token }) {
  const [activeMarket, setActiveMarket] = useState('global');
  const isAllIn = user?.plan === 'team';

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden">
        <div className="bg-[linear-gradient(135deg,rgba(110,169,201,0.22),rgba(8,10,14,0.95))] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-[#6EA9C9]/40 bg-[#6EA9C9]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9ED0E8]">
                {isAllIn ? 'All In activé' : 'Fonction premium All In'}
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-white">Prompts experts par marché</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#C9D9E3]">
                Catalyseur du soir, catalyseur de la semaine, setup swing ou portefeuille long terme : les scénarios guidés sont réservés au plan All In pour structurer les demandes et améliorer la synthèse finale.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0B1117]/80 px-4 py-3 text-sm text-[#D7E6EF] lg:max-w-sm">
              {isAllIn
                ? 'Ton plan active les presets experts sur les 3 marchés du Trading Desk.'
                : 'Les autres plans gardent la question libre. Le plan All In débloque les presets experts et leur synthèse contextualisée.'}
            </div>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <div className="flex flex-wrap gap-3">
          {MARKETS.map((market) => (
            <button
              key={market.id}
              onClick={() => setActiveMarket(market.id)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                activeMarket === market.id
                  ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
                  : 'border-white/10 text-[#9EA4AF] hover:bg-white/5'
              }`}
            >
              <div className="font-semibold">{market.label}</div>
              <div className="mt-1 text-xs text-[#6E7480]">{market.models.join(' · ')}</div>
            </button>
          ))}
        </div>
      </section>

      {activeMarket === 'global' && <GlobalMarket user={user} token={token} />}
      {activeMarket === 'nasdaq' && <NasdaqMarket user={user} token={token} />}
      {activeMarket === 'european' && <EuropeanMarket user={user} token={token} />}
    </div>
  );
}
