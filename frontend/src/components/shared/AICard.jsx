export default function AICard({ title, content, accent = '#C9A96E' }) {
  return (
    <article className="panel p-5 fade-in">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${accent}20`, color: accent }}>
          LIVE
        </span>
      </div>
      <div className="whitespace-pre-wrap text-sm leading-7 text-[#C6CBD2]">{content || 'Aucune réponse générée.'}</div>
    </article>
  );
}
