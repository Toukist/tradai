import { useState } from 'react';
import { MODELS } from '../models.js';
import AICard from './AICard.jsx';
import SynthesisCard from './SynthesisCard.jsx';
import DonutChart from './DonutChart.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const EMPTY_FUND = () => ({ name: '', type: 'Actions', pct: '', perf1y: '' });

const FUND_TYPES = [
  'Actions', 'Obligations', 'Mixte', 'Immobilier',
  'Monétaire', 'Crypto', 'Matières premières',
];

export default function PortfolioModule() {
  const [profile, setProfile] = useState({
    risk: 'Équilibré',
    horizon: '3-5ans',
    amount: '',
    currency: 'EUR',
  });
  const [funds, setFunds]         = useState([EMPTY_FUND()]);
  const [loading, setLoading]     = useState(false);
  const [responses, setResponses] = useState({});
  const [synthesis, setSynthesis] = useState('');
  const [synLoading, setSynLoading] = useState(false);
  const [error, setError]         = useState('');

  const totalPct = funds.reduce((acc, f) => acc + (parseFloat(f.pct) || 0), 0);
  const totalColor =
    totalPct > 100 ? 'text-red-400' : totalPct === 100 ? 'text-green-400' : 'text-yellow-400';

  const updateFund = (i, field, value) => {
    setFunds((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  };

  const addFund    = () => setFunds((prev) => [...prev, EMPTY_FUND()]);
  const removeFund = (i) => setFunds((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponses({});
    setSynthesis('');
    setLoading(true);
    setSynLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/portfolio`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          profile: { ...profile, amount: parseFloat(profile.amount) || 0 },
          funds: funds.map((f) => ({
            ...f,
            pct:    parseFloat(f.pct)    || 0,
            perf1y: parseFloat(f.perf1y) || 0,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur serveur');
      }

      const data = await res.json();
      setResponses(data.responses || {});
      setSynthesis(data.synthesis || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSynLoading(false);
    }
  };

  const hasResults = Object.keys(responses).length > 0 || synthesis;

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Profile */}
        <section className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4">
          <h2 className="text-base font-semibold text-white">Profil investisseur</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Risque</label>
              <select
                value={profile.risk}
                onChange={(e) => setProfile({ ...profile, risk: e.target.value })}
                className="w-full bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                {['Défensif', 'Équilibré', 'Dynamique', 'Agressif'].map((v) => (
                  <option key={v} value={v} className="bg-gray-900">{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Horizon</label>
              <select
                value={profile.horizon}
                onChange={(e) => setProfile({ ...profile, horizon: e.target.value })}
                className="w-full bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                {['<1an', '1-3ans', '3-5ans', '5-10ans', '>10ans'].map((v) => (
                  <option key={v} value={v} className="bg-gray-900">{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Montant</label>
              <input
                type="number"
                min="0"
                value={profile.amount}
                onChange={(e) => setProfile({ ...profile, amount: e.target.value })}
                placeholder="50 000"
                className="w-full bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Devise</label>
              <select
                value={profile.currency}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                className="w-full bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                {['EUR', 'USD', 'GBP', 'CHF'].map((v) => (
                  <option key={v} value={v} className="bg-gray-900">{v}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Funds */}
        <section className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Composition du portefeuille</h2>
            <span className={`text-sm font-mono font-bold ${totalColor}`}>
              Total : {Math.round(totalPct * 10) / 10}%
            </span>
          </div>

          {/* DonutChart */}
          <DonutChart funds={funds} />

          {/* Fund rows */}
          <div className="space-y-3 mt-4">
            {funds.map((fund, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={fund.name}
                  onChange={(e) => updateFund(i, 'name', e.target.value)}
                  placeholder="Nom du fonds"
                  className="col-span-4 bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
                <select
                  value={fund.type}
                  onChange={(e) => updateFund(i, 'type', e.target.value)}
                  className="col-span-3 bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                >
                  {FUND_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-gray-900">{t}</option>
                  ))}
                </select>
                <div className="col-span-2 relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={fund.pct}
                    onChange={(e) => updateFund(i, 'pct', e.target.value)}
                    placeholder="%"
                    className="w-full bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
                <div className="col-span-2 relative">
                  <input
                    type="number"
                    value={fund.perf1y}
                    onChange={(e) => updateFund(i, 'perf1y', e.target.value)}
                    placeholder="Perf 1an %"
                    className="w-full bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFund(i)}
                  disabled={funds.length === 1}
                  className="col-span-1 text-gray-500 hover:text-red-400 disabled:opacity-20 transition text-lg leading-none"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addFund}
            className="text-sm text-gray-400 hover:text-white transition border border-white/15 rounded-lg px-4 py-2 hover:bg-white/5"
          >
            + Ajouter un fonds
          </button>
        </section>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Analyse en cours…' : 'Analyser le portefeuille →'}
        </button>
      </form>

      {/* AI Cards grid */}
      {(loading || hasResults) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODELS.map((model) => (
            <AICard
              key={model.id}
              model={model}
              response={responses[model.id] || ''}
              loading={loading && !responses[model.id]}
            />
          ))}
        </div>
      )}

      {/* Synthesis */}
      {(synLoading || synthesis) && (
        <SynthesisCard synthesis={synthesis} loading={synLoading} />
      )}

      {/* MiFID II disclaimer */}
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-5 py-4 text-xs text-yellow-200/70 leading-relaxed">
        ⚠️ <strong>Avertissement MiFID II</strong> — Les analyses fournies par TradAI constituent
        des pistes de réflexion uniquement et ne constituent pas un conseil en investissement au
        sens de la directive MiFID II. Consultez un conseiller financier agréé avant toute décision
        d'investissement.
      </div>
    </div>
  );
}
