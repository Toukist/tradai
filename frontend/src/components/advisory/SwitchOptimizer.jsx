import { useState } from 'react';
import { api } from '../../utils/api';
import AICard from '../shared/AICard';
import SynthesisCard from '../shared/SynthesisCard';

export default function SwitchOptimizer({ user, token }) {
  const [currentFund, setCurrentFund] = useState('Carmignac Patrimoine');
  const [targets, setTargets] = useState('M&G Optimal Income\nDNCA Invest Eurose');
  const [reason, setReason] = useState('Réduire les frais et améliorer le profil rendement/risque');
  const [profile, setProfile] = useState('prudent');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api.switchFunds({ currentFund, targetFunds: targets.split('\n').filter(Boolean), reason, profile }, token);
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
        <h2 className="text-2xl font-semibold text-white">Switch Optimizer</h2>
        <p className="mt-2 text-sm leading-7 text-[#7A7F89]">Optimise un switch de fonds avec angle timing, pertinence et impact fiscal belge.</p>
        {!user && <p className="mt-4 rounded-xl border border-[#6EC9A9]/20 bg-[#6EC9A9]/10 px-4 py-3 text-sm text-[#A8E8D3]">Connexion requise pour le switch optimizer.</p>}
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="label">Fonds actuel</label>
            <input className="input" value={currentFund} onChange={(e) => setCurrentFund(e.target.value)} />
          </div>
          <div>
            <label className="label">Profil</label>
            <input className="input" value={profile} onChange={(e) => setProfile(e.target.value)} />
          </div>
          <div className="lg:col-span-2">
            <label className="label">Fonds cibles (une ligne par fonds)</label>
            <textarea className="input min-h-[100px]" value={targets} onChange={(e) => setTargets(e.target.value)} />
          </div>
          <div className="lg:col-span-2">
            <label className="label">Raison du switch</label>
            <textarea className="input min-h-[100px]" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="lg:col-span-2">
            <button className="btn-primary" disabled={!token || loading} type="submit">
              {loading ? 'Analyse en cours...' : 'Optimiser le switch'}
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </section>

      {data && (
        <section className="grid gap-4 xl:grid-cols-3">
          {Object.entries(data.responses || {}).map(([key, value]) => <AICard key={key} title={key.toUpperCase()} content={value} accent="#6EC9A9" />)}
          <div className="xl:col-span-3"><SynthesisCard title="Synthèse Switch" content={data.synthesis} /></div>
        </section>
      )}
    </div>
  );
}
