import { ChatHistory } from '../chat-types';
import { dbPromise } from '../indexedDB';

export class ChatService {
  /**
   * Save Chat History
   * - Stores chat for given problemName
   * - Ensures only 3 most recent chats remain
   */
  static async saveChatHistory(
    problemName: string,
    history: ChatHistory[]
  ): Promise<void> {
    const db = await dbPromise;

    await db.put('chats', { problemName, chatHistory: history });

    const allChats = await db.getAllKeys('chats');
    if (allChats.length > 3) {
      // Delete the oldest one
      // getAllKeys returns keys in creation order
      const oldestKey = allChats[0];
      await db.delete('chats', oldestKey);
    }
  }

  /**
   * Fetch Chat History
   */
  static async fetchChatHistory(
    problemName: string,
    limit: number,
    offset: number
  ): Promise<{
    totalMessageCount: number;
    chatHistory: ChatHistory[];
    allChatHistory?: ChatHistory[];
  }> {
    const db = await dbPromise;
    const chatData = await db.get('chats', problemName);
    if (!chatData) return { totalMessageCount: 0, chatHistory: [] };

    const { chatHistory } = chatData;
    const totalMessageCount = chatHistory.length;

    // Fetch the slice of chat history based on limit and offset
    const slicedHistory = chatHistory.slice(
      Math.max(totalMessageCount - offset - limit, 0),
      totalMessageCount - offset
    );
    return {
      totalMessageCount,
      chatHistory: slicedHistory,
      allChatHistory: chatHistory || [],
    };
  }

  /**
   * Clear Chat History
   */
  static async clearChatHistory(problemName: string): Promise<void> {
    const db = await dbPromise;
    await db.delete('chats', problemName);
  }

  /**
   * Fetch all chats (problem names)
   */
  static async fetchAllChats(): Promise<string[]> {
    const db = await dbPromise;
    const allChats = await db.getAllKeys('chats');
    console.log('chats', allChats);
    return allChats as string[];
  }
}
