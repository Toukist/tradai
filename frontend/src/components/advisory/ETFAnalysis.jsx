import { useState } from 'react';
import { api } from '../../utils/api';
import AICard from '../shared/AICard';
import SynthesisCard from '../shared/SynthesisCard';

function parseEtfLines(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ticker, isin] = line.split('|').map((item) => item?.trim());
      return { name, ticker, isin };
    });
}

export default function ETFAnalysis({ user, token }) {
  const [etfs, setEtfs] = useState('iShares Core MSCI World|IWDA|IE00B4L5Y983\nAmundi S&P 500 UCITS ETF|500|LU1681048804');
  const [profile, setProfile] = useState('équilibré');
  const [horizon, setHorizon] = useState('10 ans');
  const [amount, setAmount] = useState('25000');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api.compareEtfs({ etfs: parseEtfLines(etfs), profile, horizon, amount }, token);
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
        <h2 className="text-2xl font-semibold text-white">ETF Analysis</h2>
        <p className="mt-2 text-sm leading-7 text-[#7A7F89]">Compare des ETFs avec angle performance, coûts, tracking error et fiscalité belge.</p>
        {!user && <p className="mt-4 rounded-xl border border-[#6EC9A9]/20 bg-[#6EC9A9]/10 px-4 py-3 text-sm text-[#A8E8D3]">Connexion requise pour l’analyse advisory.</p>}
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="label">ETFs (format : nom|ticker|isin)</label>
            <textarea className="input min-h-[120px]" value={etfs} onChange={(e) => setEtfs(e.target.value)} />
          </div>
          <div>
            <label className="label">Profil</label>
            <input className="input" value={profile} onChange={(e) => setProfile(e.target.value)} />
          </div>
          <div>
            <label className="label">Horizon</label>
            <input className="input" value={horizon} onChange={(e) => setHorizon(e.target.value)} />
          </div>
          <div>
            <label className="label">Montant</label>
            <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full" disabled={!token || loading} type="submit">
              {loading ? 'Analyse en cours...' : 'Comparer les ETFs'}
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </section>

      {data && (
        <section className="grid gap-4 xl:grid-cols-3">
          {Object.entries(data.responses || {}).map(([key, value]) => <AICard key={key} title={key.toUpperCase()} content={value} accent="#6EC9A9" />)}
          <div className="xl:col-span-3"><SynthesisCard title="Synthèse ETF" content={data.synthesis} /></div>
        </section>
      )}
    </div>
  );
}
