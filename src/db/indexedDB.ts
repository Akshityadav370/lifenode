import { DBSchema, openDB } from 'idb';
import { Habit, HabitCompletion, Reminder, Task } from './data-types';

interface LifeNodeDB extends DBSchema {
  habits: {
    key: number;
    value: Habit;
    indexes: {
      createdAt: string;
      month: string;
    };
  };
  habitCompletions: {
    key: number;
    value: HabitCompletion;
    indexes: {
      habitId: number;
      date: string;
      habitId_date: [number, string];
      month: string;
      habitId_month: [number, string];
    };
  };
  reminders: {
    key: number;
    value: Reminder;
    indexes: {
      date: string;
    };
  };
  tasks: {
    key: number;
    value: Task;
    indexes: {
      createdAt: string;
      month: string;
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

      habitStore.createIndex('createdAt', 'createdAt'); // fetch habits by id
      habitStore.createIndex('month', 'month'); // fetch habits by month
    }
    if (!db.objectStoreNames.contains('habitCompletions')) {
      const habitCompletionsStore = db.createObjectStore('habitCompletions', {
        keyPath: 'id',
        autoIncrement: true,
      });

      habitCompletionsStore.createIndex('habitId', 'habitId'); // all completions of a habit
      habitCompletionsStore.createIndex('date', 'date'); // all completions on a date
      habitCompletionsStore.createIndex('habitId_date', ['habitId', 'date']); // lookup specific day's status for a habit
      habitCompletionsStore.createIndex('month', 'month'); // all completions of month
      habitCompletionsStore.createIndex('habitId_month', ['habitId', 'month']); // all completions of habitId for 'month'
    }
    if (!db.objectStoreNames.contains('reminders')) {
      const reminderStore = db.createObjectStore('reminders', {
        keyPath: 'id',
        autoIncrement: true,
      });

      reminderStore.createIndex('date', 'date'); // fetch reminders by day
    }
    if (!db.objectStoreNames.contains('tasks')) {
      const tasksStore = db.createObjectStore('tasks', {
        keyPath: 'id',
        autoIncrement: true,
      });
      tasksStore.createIndex('createdAt', 'createdAt'); // fetch habits by day
      tasksStore.createIndex('month', 'month'); // fetch all tasks of the month
    }
  },
});
