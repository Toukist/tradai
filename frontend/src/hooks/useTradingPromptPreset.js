import { useState } from 'react';
import {
  getDefaultTradingPrompt,
  getTradingPromptPreset,
  getTradingPromptPresets,
} from '../utils/tradingPrompts';

function buildRuntimeContext() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value || '';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  const time = `${get('hour')}:${get('minute')}`;
  const hour = parseInt(get('hour'), 10);

  let session;
  if (hour < 8 || hour >= 22) session = 'OVERNIGHT';
  else if (hour >= 17) session = 'US_OPEN';
  else if (hour >= 15) session = 'US_PREMARKET';
  else session = 'EU_OPEN';

  return { currentDate: date, currentTime: time, session };
}

export function useTradingPromptPreset(marketId) {
  const presets = getTradingPromptPresets(marketId);
  const defaultPresetId = presets[0]?.id || '';

  const [selectedPresetId, setSelectedPresetId] = useState(defaultPresetId);
  const [appliedPresetId, setAppliedPresetId] = useState(defaultPresetId);
  const [question, setQuestion] = useState(getDefaultTradingPrompt(marketId, buildRuntimeContext()));

  const selectedPreset = getTradingPromptPreset(marketId, selectedPresetId);
  const appliedPreset = getTradingPromptPreset(marketId, appliedPresetId);

  const handlePresetSelect = (presetId) => {
    setSelectedPresetId(presetId);
  };

  const handlePresetApply = (presetId) => {
    setSelectedPresetId(presetId);
    setAppliedPresetId(presetId);

    const preset = getTradingPromptPreset(marketId, presetId);
    if (preset) {
      setQuestion(preset.buildPrompt ? preset.buildPrompt(buildRuntimeContext()) : '');
    }
  };

  return {
    presets,
    selectedPreset,
    selectedPresetId,
    appliedPreset,
    appliedPresetId,
    question,
    setQuestion,
    handlePresetSelect,
    handlePresetApply,
  };
}