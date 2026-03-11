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

  return (
    <div className="space-y-6">
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
