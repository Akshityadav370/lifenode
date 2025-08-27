import { ValidModel } from '@/constants/valid_model';

export const useChromeStorage = () => {
  return {
    setKeyModel: async (apiKey: string, model: ValidModel) => {
      await chrome.storage.local.set({ [model]: apiKey });
    },

    getKeyModel: async (model: ValidModel) => {
      const result = await chrome.storage.local.get(model);
      return { model: model, apiKey: result[model] };
    },

    setSelectedModel: async (model: ValidModel) => {
      await chrome.storage.local.set({ ['selectedModel']: model });
    },

    getSelectedModel: async () => {
      const result = await chrome.storage.local.get('selectedModel');
      return result['selectedModel'] as ValidModel;
    },
  };
};
