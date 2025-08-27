import { z } from 'zod';
import { outputSchema } from '../models/model-interface';

export type Roles =
  | 'function'
  | 'system'
  | 'user'
  | 'assistant'
  | 'data'
  | 'tool';

export interface ChatHistory {
  role: Roles;
  content: string | z.infer<typeof outputSchema>;
}

// parse ChatHistory to new interface where content if z.infer<typeof outputSchema> than make it string

export interface ChatHistoryParsed {
  role: Roles;
  content: string;
}

export const parseChatHistory = (
  chatHistory: ChatHistory[]
): ChatHistoryParsed[] => {
  return chatHistory.map((history) => {
    return {
      role: history.role,
      content:
        typeof history.content === 'string'
          ? history.content
          : JSON.stringify(history.content),
    };
  });
};

export const SupportedLanguages = [
  'c',
  'cpp',
  'csharp',
  'cs',
  'dart',
  'elixir',
  'erlang',
  'go',
  'java',
  'javascript',
  'jsonp',
  'jsx',
  'php',
  'python',
  'racket',
  'rkt',
  'ruby',
  'rb',
  'rust',
  'scala',
  'sql',
  'Swift',
  'typescript',
  'tsx',
] as const;
