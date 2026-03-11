import { useMemo, useState } from 'react';
import { api } from '../../utils/api';
import AICard from '../shared/AICard';
import SynthesisCard from '../shared/SynthesisCard';
import DonutChart from '../shared/DonutChart';

function parsePortfolioLines(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ticker, pct] = line.split('|').map((item) => item?.trim());
      return { name, ticker, pct: Number(pct) || 0, type: 'fund' };
    });
}

export default function PortfolioAnalysis({ user, token }) {
  const [positions, setPositions] = useState('iShares Core MSCI World|IWDA|55\nAmundi S&P 500|500|25\nXtrackers Euro Stoxx 600|EXSA|20');
  const [risk, setRisk] = useState('équilibré');
  const [horizon, setHorizon] = useState('12 ans');
  const [amount, setAmount] = useState('100000');
  const [currency, setCurrency] = useState('EUR');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const funds = useMemo(() => parsePortfolioLines(positions), [positions]);
  const chartItems = funds.map((fund, index) => ({
    label: fund.name,
    value: fund.pct,
    color: ['#C9A96E', '#6EC9A9', '#6EA9C9', '#8B5CF6'][index % 4],
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api.portfolio({ profile: { risk, horizon, amount, currency }, funds }, token);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <h2 className="text-2xl font-semibold text-white">Portfolio Analysis</h2>
            <p className="mt-2 text-sm leading-7 text-[#7A7F89]">Vue consolidée d’un portefeuille, risques, doublons et recommandations de réallocation.</p>
            {!user && <p className="mt-4 rounded-xl border border-[#6EC9A9]/20 bg-[#6EC9A9]/10 px-4 py-3 text-sm text-[#A8E8D3]">Connexion requise pour l’analyse de portefeuille.</p>}
          </div>
          <div className="panel flex items-center justify-center border-white/5 bg-[#11141B] p-4">
            <DonutChart items={chartItems} />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="label">Positions (format : nom|ticker|poids)</label>
            <textarea className="input min-h-[120px]" value={positions} onChange={(e) => setPositions(e.target.value)} />
          </div>
          <div>
            <label className="label">Risque</label>
            <input className="input" value={risk} onChange={(e) => setRisk(e.target.value)} />
          </div>
          <div>
            <label className="label">Horizon</label>
            <input className="input" value={horizon} onChange={(e) => setHorizon(e.target.value)} />
          </div>
          <div>
            <label className="label">Montant</label>
            <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="label">Devise</label>
            <input className="input" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
          <div className="lg:col-span-2">
            <button className="btn-primary" disabled={!token || loading} type="submit">
              {loading ? 'Analyse en cours...' : 'Analyser le portefeuille'}
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </section>

      {data && (
        <section className="grid gap-4 xl:grid-cols-3">
          {Object.entries(data.responses || {}).map(([key, value]) => <AICard key={key} title={key.toUpperCase()} content={value} accent="#6EC9A9" />)}
          <div className="xl:col-span-3"><SynthesisCard title="Synthèse Portefeuille" content={data.synthesis} /></div>
        </section>
      )}
    </div>
  );
}
