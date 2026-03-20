export default function PromptPresetSelector({
  presets = [],
  selectedPresetId,
  appliedPresetId,
  onSelectPreset,
  onApplyPreset,
}) {
  const activePreset = presets.find((preset) => preset.id === selectedPresetId) || presets[0];
  const appliedPreset = presets.find((preset) => preset.id === appliedPresetId) || presets[0];

  if (!activePreset) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="label">Angle d'analyse</label>
          <select
            className="input"
            value={activePreset.id}
            onChange={(event) => onSelectPreset(event.target.value)}
          >
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-secondary" type="button" onClick={() => onApplyPreset(activePreset.id)}>
          Charger ce prompt
        </button>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#8E95A3]">{activePreset.description}</p>
      {appliedPreset && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#7A7F89]">
          <span className="uppercase tracking-[0.2em]">Prompt chargé</span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-semibold text-[#C9A96E]">
            {appliedPreset.label}
          </span>
        </div>
      )}
    </div>
  );
}