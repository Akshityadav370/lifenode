import { ValidModel } from '@/constants/valid_modal';
import { models } from '@/models';
import {
  GenerateResponseParamsType,
  ModelInterface,
  outputSchema,
} from '@/models/model-interface';
import { z } from 'zod';

export class ModelService {
  private activeModel: ModelInterface | null = null;

  selectModal(modalName: ValidModel, apiKey?: string) {
    if (models[modalName]) {
      this.activeModel = models[modalName];
      this.activeModel.init(apiKey);
    } else {
      throw new Error(`Modal "${modalName}" not found`);
    }
  }

  /**
   * Generates a response using the currently active modal.
   * @param props - The parameters required to generate the response.
   * @returns A promise that resolves to an object containing either an error or the successful response.
   * @throws Will throw an error if no modal is selected.
   */
  async generate(props: GenerateResponseParamsType): Promise<
    Promise<{
      error: Error | null;
      success: z.infer<typeof outputSchema> | null;
    }>
  > {
    if (!this.activeModel) {
      throw new Error('No model selected');
    }
    return this.activeModel.generateResponse(props);
  }
}
