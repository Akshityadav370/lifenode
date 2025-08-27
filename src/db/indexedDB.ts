import { DBSchema, openDB } from 'idb';
import { Alarm, Habit, HabitCompletion, Task } from './data-types';
import { ChatHistory } from './chat-types';

interface LifeNodeDB extends DBSchema {
  habits: {
    key: number;
    value: Habit;
    indexes: {
      month: string;
    };
  };
  habitCompletions: {
    key: number;
    value: HabitCompletion;
    indexes: {
      habitId: number;
      habitId_date: [number, string];
      habitId_month: [number, string];
    };
  };
  tasks: {
    key: number;
    value: Task;
    indexes: {
      month: string;
    };
  };
  alarms: {
    key: number;
    value: Alarm;
    indexes: {
      name: string;
    };
  };
  chats: {
    key: string;
    value: { problemName: string; chatHistory: ChatHistory[] };
    indexes: {
      problemName: string;
    };
  };
}

export const dbPromise = openDB<LifeNodeDB>('lifenode-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('habits')) {
      const habitStore = db.createObjectStore('habits', {
        keyPath: 'id',
        autoIncrement: true,
      });

      habitStore.createIndex('month', 'month'); // fetch habits by month
    }
    if (!db.objectStoreNames.contains('habitCompletions')) {
      const habitCompletionsStore = db.createObjectStore('habitCompletions', {
        keyPath: 'id',
        autoIncrement: true,
      });

      habitCompletionsStore.createIndex('habitId', 'habitId'); // all completions of a habit
      habitCompletionsStore.createIndex('habitId_date', ['habitId', 'date']); // lookup specific day's status for a habit
      habitCompletionsStore.createIndex('habitId_month', ['habitId', 'month']); // all completions of habitId for 'month'
    }
    if (!db.objectStoreNames.contains('tasks')) {
      const tasksStore = db.createObjectStore('tasks', {
        keyPath: 'id',
        autoIncrement: true,
      });
      tasksStore.createIndex('month', 'month'); // fetch all tasks of the month
    }
    if (!db.objectStoreNames.contains('alarms')) {
      const alarmsStore = db.createObjectStore('alarms', {
        keyPath: 'id',
        autoIncrement: true,
      });
      alarmsStore.createIndex('name', 'name', { unique: true });
    }
    if (!db.objectStoreNames.contains('chats')) {
      const chatStore = db.createObjectStore('chats', {
        keyPath: 'problemName',
      });
      chatStore.createIndex('problemName', 'problemName', { unique: true });
    }
  },
});
