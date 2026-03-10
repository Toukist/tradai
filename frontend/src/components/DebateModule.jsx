import { useState } from 'react';
import { MODELS } from '../models.js';
import AICard from './AICard.jsx';
import SynthesisCard from './SynthesisCard.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function DebateModule() {
  const [question, setQuestion]       = useState('');
  const [selected, setSelected]       = useState(MODELS.map((m) => m.id));
  const [loading, setLoading]         = useState(false);
  const [responses, setResponses]     = useState({});
  const [synthesis, setSynthesis]     = useState('');
  const [synLoading, setSynLoading]   = useState(false);
  const [error, setError]             = useState('');

  const toggleModel = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || selected.length === 0) return;

    setError('');
    setResponses({});
    setSynthesis('');
    setLoading(true);
    setSynLoading(true);

    try {
      const res  = await fetch(`${API_URL}/api/debate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question: question.trim(), models: selected }),
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

  const handleReset = () => {
    setQuestion('');
    setResponses({});
    setSynthesis('');
    setError('');
  };

  const hasResults = Object.keys(responses).length > 0 || synthesis;

  return (
    <div className="space-y-6">
      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Question financière
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            placeholder="Ex: Faut-il surpondérer les actions européennes en 2026 face à l'instabilité géopolitique ?"
            className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder-gray-600 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-white/20 transition"
          />
        </div>

        {/* Model selector */}
        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">Modèles participants</p>
          <div className="flex flex-wrap gap-3">
            {MODELS.map((model) => {
              const active = selected.includes(model.id);
              return (
                <label
                  key={model.id}
                  className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 rounded-lg border transition"
                  style={{
                    borderColor: active ? model.color : 'rgba(255,255,255,0.1)',
                    background: active ? `${model.color}18` : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleModel(model.id)}
                    className="sr-only"
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: active ? model.color : '#555' }}
                  />
                  <span className="text-sm font-medium" style={{ color: active ? model.color : '#888' }}>
                    {model.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !question.trim() || selected.length === 0}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Débat en cours…' : 'Lancer le débat →'}
          </button>
          {hasResults && (
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </form>

      {/* AI Cards grid */}
      {(loading || hasResults) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODELS.filter((m) => selected.includes(m.id)).map((model) => (
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
    </div>
  );
}
