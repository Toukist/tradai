import { useState } from 'react';
import { api } from '../../utils/api';
import AICard from '../shared/AICard';
import PromptPresetSelector from '../shared/PromptPresetSelector';
import SynthesisCard from '../shared/SynthesisCard';
import ModelSelector from '../shared/ModelSelector';
import { useTradingPromptPreset } from '../../hooks/useTradingPromptPreset';

const MARKET_ID = 'global';

export default function GlobalMarket({ user, token }) {
  const isAllIn = user?.plan === 'team';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    presets,
    selectedPresetId,
    appliedPresetId,
    appliedPreset,
    question,
    setQuestion,
    handlePresetSelect,
    handlePresetApply,
  } = useTradingPromptPreset(MARKET_ID);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api.debate({
        question,
        market: 'global',
        promptPresetId: isAllIn ? appliedPreset?.id : undefined,
        promptPresetLabel: isAllIn ? appliedPreset?.label : undefined,
      }, token);
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
            <h2 className="mt-2 text-2xl font-semibold text-white">Global Market</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7A7F89]">Macro mondiale, corrélations cross-assets, banques centrales et arbitrage risk-on/risk-off.</p>
          </div>
          <ModelSelector models={['Claude', 'Gemini', 'GPT']} />
        </div>
        {!user && <p className="mt-4 rounded-xl border border-[#C9A96E]/20 bg-[#C9A96E]/10 px-4 py-3 text-sm text-[#E7D0A1]">Connecte-toi pour lancer des requêtes live.</p>}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {isAllIn ? (
            <PromptPresetSelector
              presets={presets}
              selectedPresetId={selectedPresetId}
              appliedPresetId={appliedPresetId}
              onSelectPreset={handlePresetSelect}
              onApplyPreset={handlePresetApply}
            />
          ) : (
            <div className="rounded-2xl border border-[#6EA9C9]/20 bg-[#6EA9C9]/10 p-4 text-sm leading-6 text-[#D8E6F0]">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6EA9C9]">Réservé All In</div>
              <p className="mt-2">Les prompts experts par marché sont disponibles uniquement sur l’offre All In. Tu peux continuer à poser une question libre ci-dessous.</p>
            </div>
          )}
          <div>
            <label className="label">Question</label>
            <textarea className="input min-h-[130px]" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="btn-primary" disabled={!token || loading} type="submit">
            {loading ? 'Analyse en cours...' : 'Lancer l’analyse globale'}
          </button>
        </form>
      </section>

      {data && (
        <section className="grid gap-4 xl:grid-cols-3">
          {Object.entries(data.responses || {}).map(([key, value]) => (
            <AICard key={key} title={key.toUpperCase()} content={value} />
          ))}
          <div className="xl:col-span-3">
            <SynthesisCard title={`Synthèse Global Market${appliedPreset?.label ? ` · ${appliedPreset.label}` : ''}`} content={data.synthesis} />
          </div>
        </section>
      )}
    </div>
  );
}
