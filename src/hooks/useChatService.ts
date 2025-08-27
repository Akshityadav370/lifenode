import { ChatHistory } from '@/db/chat-types';

export const useChatService = () => {
  return {
    saveChatHistory: async (problemName: string, history: ChatHistory[]) => {
      const res = await chrome.runtime.sendMessage({
        type: 'chat:save',
        payload: { problemName, history },
      });
      if (!res?.ok) throw new Error(res?.error || 'Failed to save chat');
    },

    fetchChatHistory: async (
      problemName: string,
      limit: number,
      offset: number
    ) => {
      const res = await chrome.runtime.sendMessage({
        type: 'chat:fetch',
        payload: { problemName, limit, offset },
      });
      if (!res?.ok) throw new Error(res?.error || 'Failed to fetch chat');
      return res.data as {
        totalMessageCount: number;
        chatHistory: ChatHistory[];
        allChatHistory?: ChatHistory[];
      };
    },

    clearChatHistory: async (problemName: string) => {
      const res = await chrome.runtime.sendMessage({
        type: 'chat:clear',
        payload: { problemName },
      });
      if (!res?.ok) throw new Error(res?.error || 'Failed to clear chat');
    },

    fetchAllChats: async () => {
      const res = await chrome.runtime.sendMessage({ type: 'chat:list' });
      if (!res?.ok) throw new Error(res?.error || 'Failed to list chats');
      return res.data as string[];
    },
  };
};
