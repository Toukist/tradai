import { useState } from 'react';
import { api } from '../../utils/api';
import AICard from '../shared/AICard';
import SynthesisCard from '../shared/SynthesisCard';

function parseFundLines(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, isin] = line.split('|').map((item) => item?.trim());
      return { name, isin };
    });
}

export default function FundAnalysis({ user, token }) {
  const [funds, setFunds] = useState('Carmignac Patrimoine|FR0010135103\nM&G Optimal Income|GB00B1VMCY93');
  const [profile, setProfile] = useState('prudent');
  const [horizon, setHorizon] = useState('7 ans');
  const [amount, setAmount] = useState('50000');
  const [question, setQuestion] = useState('Analyse ces fonds et recommande la meilleure option pour un investisseur belge.');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api.analyzeFunds({ funds: parseFundLines(funds), profile, horizon, amount, question }, token);
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
        <h2 className="text-2xl font-semibold text-white">Fund Analysis</h2>
        <p className="mt-2 text-sm leading-7 text-[#7A7F89]">Analyse de fonds, ratings, frais, gestionnaire et comparables patrimoniaux.</p>
        {!user && <p className="mt-4 rounded-xl border border-[#6EC9A9]/20 bg-[#6EC9A9]/10 px-4 py-3 text-sm text-[#A8E8D3]">Connexion requise pour l’analyse advisory.</p>}
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="label">Fonds (format : nom|isin)</label>
            <textarea className="input min-h-[120px]" value={funds} onChange={(e) => setFunds(e.target.value)} />
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
          <div className="lg:col-span-2">
            <label className="label">Question personnalisée</label>
            <textarea className="input min-h-[100px]" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>
          <div className="lg:col-span-2">
            <button className="btn-primary" disabled={!token || loading} type="submit">
              {loading ? 'Analyse en cours...' : 'Analyser les fonds'}
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </section>

      {data && (
        <section className="grid gap-4 xl:grid-cols-3">
          {Object.entries(data.responses || {}).map(([key, value]) => <AICard key={key} title={key.toUpperCase()} content={value} accent="#6EC9A9" />)}
          <div className="xl:col-span-3"><SynthesisCard title="Synthèse Funds" content={data.synthesis} /></div>
        </section>
      )}
    </div>
  );
}
