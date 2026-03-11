import { useState } from 'react';
import { api } from '../../utils/api';
import AICard from '../shared/AICard';
import SynthesisCard from '../shared/SynthesisCard';
import ModelSelector from '../shared/ModelSelector';

const DEFAULT_QUESTION = 'Scan le Nasdaq et donne-moi le meilleur ticker US du jour avec catalyst, entry, stop et targets.';

export default function NasdaqMarket({ user, token }) {
  const [question, setQuestion] = useState(DEFAULT_QUESTION);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api.debate({ question, market: 'nasdaq' }, token);
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#6E7480]">Trading Desk</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Nasdaq / US Market</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7A7F89]">Earnings, options flow, momentum tech, short squeeze et sentiment retail US.</p>
          </div>
          <ModelSelector models={['Grok', 'GPT', 'Claude']} />
        </div>
        {!user && <p className="mt-4 rounded-xl border border-[#C9A96E]/20 bg-[#C9A96E]/10 px-4 py-3 text-sm text-[#E7D0A1]">Connexion requise pour les analyses live Nasdaq.</p>}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="label">Question</label>
            <textarea className="input min-h-[130px]" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="btn-primary" disabled={!token || loading} type="submit">
            {loading ? 'Analyse en cours...' : 'Lancer l’analyse Nasdaq'}
          </button>
        </form>
      </section>

      {data && (
        <section className="grid gap-4 xl:grid-cols-3">
          {Object.entries(data.responses || {}).map(([key, value]) => (
            <AICard key={key} title={key.toUpperCase()} content={value} accent={key === 'grok' ? '#8B5CF6' : '#C9A96E'} />
          ))}
          <div className="xl:col-span-3">
            <SynthesisCard title="Synthèse Nasdaq" content={data.synthesis} />
          </div>
        </section>
      )}
    </div>
  );
}
