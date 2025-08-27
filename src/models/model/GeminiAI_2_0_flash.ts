import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  GenerateResponseParamsType,
  GenerateResponseReturnType,
  ModelInterface,
} from '../model-interface';
import { VALID_MODELS } from '@/constants/valid_model';
import { generateObjectResponse } from '../utils';

export class GeminiAI_2_0_flash implements ModelInterface {
  name = 'gemini_2.0_flash';
  private apiKey: string = '';

  init(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    props: GenerateResponseParamsType
  ): GenerateResponseReturnType {
    try {
      const google = createGoogleGenerativeAI({
        apiKey: this.apiKey,
      });

      let data = await generateObjectResponse({
        model: google(
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
