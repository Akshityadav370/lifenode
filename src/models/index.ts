import { ValidModel } from '@/constants/valid_modal';
import { ModelInterface } from './model-interface';
import { GeminiAI_1_5_pro } from './model/GeminiAI_1_5_pro';
import { OpenAI_3_5_turbo } from './model/OpenAI_3_5_turbo';
import { OpenAi_4o } from './model/OpenAI_4o';

/**
 * This object contains all the modals that are available in the extension.
 * @type {Record<ValidModel, ModelInterface>}
 */
export const models: Record<ValidModel, ModelInterface> = {
  'openai_3.5_turbo': new OpenAI_3_5_turbo(),
  openai_4o: new OpenAi_4o(),
  'gemini_1.5_pro': new GeminiAI_1_5_pro(),
};
