export default function SynthesisCard({ synthesis, loading }) {
  const gradient =
    'linear-gradient(90deg, #C9A96E, #6EC9A9, #6EA9C9, #C96E6E, #A96EC9)';

  return (
    <div
      className="rounded-xl bg-white/5 border border-white/10 overflow-hidden mt-6"
      style={{ borderTop: '3px solid transparent', borderImage: `${gradient} 1` }}
    >
      {/* Rainbow top border via pseudo approach */}
      <div style={{ height: 3, background: gradient }} />

      <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
        <div
          className="w-5 h-5 rounded-full flex-shrink-0"
          style={{ background: gradient }}
        />
        <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
          Synthèse Finale — Meilleure réponse consolidée
        </span>
      </div>

      <div className="px-5 py-5 text-sm text-gray-200 leading-relaxed min-h-[120px]">
        {loading ? (
          <div className="flex items-center gap-2 mt-2">
            <span className="dot" style={{ background: '#C9A96E' }} />
            <span className="dot" style={{ background: '#6EC9A9' }} />
            <span className="dot" style={{ background: '#A96EC9' }} />
            <span className="text-xs ml-1 text-gray-400">Synthèse en cours…</span>
          </div>
        ) : synthesis ? (
          <div className="fade-in whitespace-pre-wrap">{synthesis}</div>
        ) : (
          <span className="text-gray-600 italic">La synthèse apparaîtra ici.</span>
        )}
      </div>
    </div>
  );
}
