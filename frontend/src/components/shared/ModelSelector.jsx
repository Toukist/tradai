export default function ModelSelector({ models = [] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {models.map((model) => (
        <span key={model} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9EA4AF]">
          {model}
        </span>
      ))}
    </div>
  );
}
