import {
  generateObject,
  GenerateObjectResult,
  LanguageModel,
  ModelMessage,
} from 'ai';
import { ChatHistoryParsed } from '../db/chat-types';
import { outputSchema } from './model-interface';

/**
 * Generates an object response based on the provided parameters.
 *
 * @param {Object} params - The parameters for generating the object response.
 * @param {ChatHistoryParsed[] | []} params.messages - The chat history messages.
 * @param {string} params.systemPrompt - The system prompt to use.
 * @param {string} params.prompt - The user prompt to use.
 * @param {string} [params.extractedCode] - Optional extracted code to include in the messages.
 * @param {LanguageModelV1} params.model - The language model to use.
 * @returns {Promise<GenerateObjectResult>} A promise that resolves with the generated object response.
 */
export const generateObjectResponse = async ({
  messages,
  systemPrompt,
  prompt,
  extractedCode,
  model,
}: {
  messages: ChatHistoryParsed[] | [];
  systemPrompt: string;
  prompt: string;
  extractedCode?: string;
  model: LanguageModel;
}): Promise<
  GenerateObjectResult<{
    feedback: string;
    hints?: string[] | undefined;
    snippet?: string | undefined;
    programmingLanguage?: string | undefined;
  }>
> => {
  const data = await generateObject({
    model,
    schema: outputSchema,
    output: 'object',
    messages: [
      { role: 'system', content: systemPrompt },
      extractedCode
        ? {
            role: 'system',
            content: `extractedCode (this code is written by user): ${extractedCode}`,
          }
        : null,
      ...messages,
      { role: 'user', content: prompt },
    ].filter(Boolean) as ModelMessage[],
  });

  return data;
};
