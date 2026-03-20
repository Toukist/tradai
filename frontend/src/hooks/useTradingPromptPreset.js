import { useState } from 'react';
import {
  getDefaultTradingPrompt,
  getTradingPromptPreset,
  getTradingPromptPresets,
} from '../utils/tradingPrompts';

export function useTradingPromptPreset(marketId) {
  const presets = getTradingPromptPresets(marketId);
  const defaultPresetId = presets[0]?.id || '';

  const [selectedPresetId, setSelectedPresetId] = useState(defaultPresetId);
  const [appliedPresetId, setAppliedPresetId] = useState(defaultPresetId);
  const [question, setQuestion] = useState(getDefaultTradingPrompt(marketId));

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
      setQuestion(preset.prompt);
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