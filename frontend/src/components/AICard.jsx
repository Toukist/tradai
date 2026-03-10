export default function AICard({ model, response, loading }) {
  return (
    <div
      className="rounded-xl bg-white/5 border border-white/10 overflow-hidden flex flex-col"
      style={{ borderTop: `3px solid ${model.color}` }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: model.color }}
        />
        <span className="font-semibold text-white text-sm">{model.name}</span>
        <span className="text-xs text-gray-500 ml-1">{model.company}</span>
      </div>

      {/* Body */}
      <div className="px-4 py-4 text-sm text-gray-300 leading-relaxed flex-1 min-h-[120px]">
        {loading ? (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="dot" style={{ background: model.color }} />
            <span className="dot" style={{ background: model.color }} />
            <span className="dot" style={{ background: model.color }} />
            <span className="text-xs ml-1" style={{ color: model.color }}>
              Analyse en cours…
            </span>
          </div>
        ) : response ? (
          <div className="fade-in whitespace-pre-wrap">{response}</div>
        ) : (
          <span className="text-gray-600 italic">En attente…</span>
        )}
      </div>
    </div>
  );
}
