export default function SynthesisCard({ title = 'Synthèse', content }) {
  return (
    <section className="panel border-[#C9A96E]/30 bg-gradient-to-br from-[#13150A] to-[#0D0F14] p-6 fade-in">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A96E]/15 text-[#C9A96E]">✦</div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#8A7A59]">Arbitrage</div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>
      <div className="whitespace-pre-wrap text-sm leading-7 text-[#E0DDD6]">{content || 'Synthèse indisponible.'}</div>
    </section>
  );
}
