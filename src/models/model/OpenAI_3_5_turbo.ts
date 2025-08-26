import { VALID_MODELS } from '@/constants/valid_modal';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObjectResponse } from '../utils';
import {
  GenerateResponseParamsType,
  GenerateResponseReturnType,
  ModelInterface,
} from '../model-interface';

export class OpenAI_3_5_turbo implements ModelInterface {
  name = 'openai_3.5_turbo';
  private apiKey: string = '';

  init(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    props: GenerateResponseParamsType
  ): GenerateResponseReturnType {
    try {
      const openai = createOpenAI({
        // compatibility: 'strict',
        apiKey: this.apiKey,
      });

      let data = await generateObjectResponse({
        model: openai(
          VALID_MODELS.find((model) => model.name === this.name)?.model!
        ),
        messages: props.messages,
        systemPrompt: props.systemPrompt,
        prompt: props.prompt,
        extractedCode: props.extractedCode,
      });

      return {
        error: null,
        success: data.object,
      };
    } catch (error: any) {
      return { error, success: null };
    }
  }
}
