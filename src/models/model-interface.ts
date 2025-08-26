import { z } from 'zod';
import { ChatHistoryParsed, SupportedLanguages } from '../db/chat-types';

/**
 * Defines the contract for AI modal implementations.
 *
 * Each modal must have a unique `name` and provide methods for initialization
 * and response generation.
 */
export abstract class ModelInterface {
  abstract name: string;

  /**
   * Initializes the modal with the provided API key.
   *
   * @param apiKey - The API key used to authenticate with the AI service.
   */
  abstract init(apiKey?: string): void;

  /**
   * Generates a response using the AI model.
   *
   * @param prompt - The main prompt provided by the user.
   * @param systemPrompt - A system-level instruction to guide the AI.
   * @param messages - A parsed history of the chat for context.
   * @param extractedCode - (Optional) A code snippet to assist the AI in its response.
   *
   * @returns A promise resolving to an object containing either:
   *  - `error`: Any error encountered during the API call.
   *  - `success`: The successful response data adhering to `outputSchema`.
   */
  abstract generateResponse(props: GenerateResponseParamsType): Promise<{
    error: Error | null;
    success: z.infer<typeof outputSchema> | null;
  }>;
}

/**
 * Defines the contract for AI modal implementations.
 */
export type GenerateResponseReturnType = Promise<{
  error: Error | null;
  success: z.infer<typeof outputSchema> | null | any;
}>;

/**
 * Defines the parameters for generating a response.
 */
export type GenerateResponseParamsType = {
  prompt: string;
  systemPrompt: string;
  messages: ChatHistoryParsed[] | [];
  extractedCode?: string;
};

export const outputSchema = z.object({
  feedback: z.string(),
  hints: z
    .array(z.string())
    .max(2, 'You can only provide up to 2 hints.')
    .optional()
    .describe('max 2 hints'),
  snippet: z.string().optional().describe('code snippet should be in format.'),
  programmingLanguage: z
    .enum(SupportedLanguages)
    .optional()
    .describe('Programming language code as supports by prismjs'),
});
