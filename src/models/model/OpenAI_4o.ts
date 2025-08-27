import { createOpenAI } from '@ai-sdk/openai';
import {
  GenerateResponseParamsType,
  GenerateResponseReturnType,
  ModelInterface,
} from '../model-interface';
import { generateObjectResponse } from '../utils';
import { VALID_MODELS } from '@/constants/valid_model';

export class OpenAi_4o implements ModelInterface {
  name = 'openai_4o';
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
