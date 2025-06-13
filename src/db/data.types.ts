export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type ReminderFrequency = 'hourly' | 'custom' | 'daily' | 'weekly';

export interface Habit {
  id: number;
  name: string;
  frequency: HabitFrequency;
  streak: number;
  lastCompleted: string; // Format: "YYYY-MM-DD"
  createdAt: string; // Format: "YYYY-MM"
}

export interface HabitCompletion {
  id: number;
  habitId: number;
  date: string; // Format: "YYYY-MM-DD"
  completed: boolean;
}

export interface Reminder {
  id: number;
  message: string;
  time: string; // Format: "HH:mm"
  frequency: ReminderFrequency;
  date: string; // Format: "YYYY-MM-DD"
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  createdAt: string; // Format: "YYYY-MM-DD"
  completed: boolean;
}
