import { Habit, HabitCompletion } from '../data-types';
import { dbPromise } from '../indexedDB';

export class HabitService {
  // ==================== HABIT CRUD OPERATIONS ====================

  /**
   * Create a new habit
   */
  static async createHabit(
    habitData: Omit<Habit, 'id' | 'streak' | 'lastCompleted' | 'createdAt'>
  ): Promise<Habit> {
    const db = await dbPromise;

    const newHabit: Omit<Habit, 'id'> = {
      ...habitData,
      streak: 0,
      createdAt: new Date().toISOString().slice(0, 11), // "YYYY-MM-DD" format
    };

    const id = await db.add('habits', newHabit as Habit);
    return { ...newHabit, id } as Habit;
  }

  /**
   * Get all habits
   */
  static async getAllHabits(): Promise<Habit[]> {
    const db = await dbPromise;
    return await db.getAll('habits');
  }

  /**
   * Get a specific habit by ID
   */
  static async getHabitById(id: number): Promise<Habit | undefined> {
    const db = await dbPromise;
    return await db.get('habits', id);
  }

  /**
   * Delete a habit (and all its completions)
   */
  static async deleteHabit(id: number): Promise<boolean> {
    const db = await dbPromise;

    try {
      // Delete all completions for this habit
      const completions = await db.getAllFromIndex(
        'habitCompletions',
        'habitId',
        id
      );
      for (const completion of completions) {
        await db.delete('habitCompletions', completion.id);
      }

      // Delete the habit itself
      await db.delete('habits', id);
      return true;
    } catch (error) {
      console.error('Error deleting habit:', error);
      return false;
    }
  }

  // ==================== HABIT COMPLETION OPERATIONS ====================
  /**
   * Get all completions for a habit
   */
  static async getHabitCompletions(
    habitId: number
  ): Promise<HabitCompletion[]> {
    const db = await dbPromise;
    return await db.getAllFromIndex('habitCompletions', 'habitId', habitId);
  }

  /**
   * Get all habit completions for a specific month
   */
  static async getHabitCompletionsForMonth(
    habitId: number,
    month: string
  ): Promise<HabitCompletion[]> {
    const db = await dbPromise;
    return await db.getAllFromIndex('habitCompletions', 'habitId_month', [
      habitId,
      month,
    ]);
  }

  /**
   * Get all habits with their monthly completion data
   */
  static async getHabitsForMonth(
    month: string
  ): Promise<Array<Habit & { completions: Record<string, HabitCompletion> }>> {
    const db = await dbPromise;
    const habits = await db.getAll('habits');

    const habitsWithCompletions = await Promise.all(
      habits.map(async (habit) => {
        const completions = await this.getHabitCompletionsForMonth(
          habit.id,
          month
        );

        const completionsRecord: Record<string, HabitCompletion> = {};
        completions.forEach((completion) => {
          completionsRecord[completion.date] = completion;
        });

        return { ...habit, completions: completionsRecord };
      })
    );

    return habitsWithCompletions;
  }

  /**
   * Toggle habit completion for a specific date and return updated completion record
   */
  static async toggleHabitCompletion(
    habitId: number,
    date: string,
    month: string
  ): Promise<HabitCompletion> {
    const db = await dbPromise;

    const existing = await db.getFromIndex('habitCompletions', 'habitId_date', [
      habitId,
      date,
    ]);

    let updatedCompletion: HabitCompletion;

    if (existing) {
      updatedCompletion = { ...existing, completed: !existing.completed };
      await db.put('habitCompletions', updatedCompletion);
    } else {
      const newCompletion: Omit<HabitCompletion, 'id'> = {
        habitId,
        date,
        month,
        completed: true,
      };
      const id = await db.add(
        'habitCompletions',
        newCompletion as HabitCompletion
      );
      updatedCompletion = { ...newCompletion, id } as HabitCompletion;
    }

    await this.updateHabitStreak(habitId, date);

    return updatedCompletion;
  }

  // ==================== STREAK CALCULATION ====================

  /**
   * Calculate and update habit streak
   */
  private static async updateHabitStreak(
    habitId: number,
    fromDate: string
  ): Promise<void> {
    const db = await dbPromise;

    const habit = await db.get('habits', habitId);
    if (!habit) return;

    const completions = await this.getHabitCompletions(habitId);
    const streak = this.calculateStreak(completions, habit.frequency);

    await db.put('habits', {
      ...habit,
      streak,
      lastCompleted: fromDate,
    });
  }

  /**
   * Calculate streak based on completions and frequency
   */
  private static calculateStreak(
    completions: HabitCompletion[],
    frequency: 'daily' | 'weekly' | 'monthly'
  ): number {
    if (completions.length === 0) return 0;

    // Sort completions by date (newest first)
    const sortedCompletions = completions
      .filter((c) => c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedCompletions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    let currentDate = new Date(sortedCompletions[0].date);

    // Check if the streak is current (completed today or yesterday for daily habits)
    const daysDiff = Math.floor(
      (today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (frequency === 'daily') {
      if (daysDiff > 1) return 0; // Streak broken if more than 1 day gap

      streak = 1;
      for (let i = 1; i < sortedCompletions.length; i++) {
        const prevDate = new Date(sortedCompletions[i - 1].date);
        const currDate = new Date(sortedCompletions[i].date);
        const diff = Math.floor(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diff === 1) {
          streak++;
        } else {
          break;
        }
      }
    } else if (frequency === 'weekly') {
      // Similar logic for weekly - check if completions are in consecutive weeks
      streak = this.calculateWeeklyStreak(sortedCompletions);
    } else if (frequency === 'monthly') {
      // Similar logic for monthly - check if completions are in consecutive months
      streak = this.calculateMonthlyStreak(sortedCompletions);
    }

    return streak;
  }

  /**
   * Calculate weekly streak
   */
  private static calculateWeeklyStreak(completions: HabitCompletion[]): number {
    const weeklyCompletions = new Map<string, boolean>();

    completions.forEach((completion) => {
      const date = new Date(completion.date);
      const weekKey = this.getWeekKey(date);
      weeklyCompletions.set(weekKey, true);
    });

    const sortedWeeks = Array.from(weeklyCompletions.keys()).sort().reverse();

    let streak = 0;
    const currentWeek = this.getWeekKey(new Date());

    for (let i = 0; i < sortedWeeks.length; i++) {
      const weekDiff = this.getWeekDifference(sortedWeeks[0], sortedWeeks[i]);
      if (weekDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate monthly streak
   */
  private static calculateMonthlyStreak(
    completions: HabitCompletion[]
  ): number {
    const monthlyCompletions = new Map<string, boolean>();

    completions.forEach((completion) => {
      const monthKey = completion.date.slice(0, 7); // "YYYY-MM"
      monthlyCompletions.set(monthKey, true);
    });

    const sortedMonths = Array.from(monthlyCompletions.keys()).sort().reverse();

    let streak = 0;
    for (let i = 0; i < sortedMonths.length; i++) {
      const monthDiff = this.getMonthDifference(
        sortedMonths[0],
        sortedMonths[i]
      );
      if (monthDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get week key for a date (ISO week)
   */
  private static getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  /**
   * Get ISO week number
   */
  private static getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Calculate difference between two weeks
   */
  private static getWeekDifference(week1: string, week2: string): number {
    const [year1, w1] = week1.split('-W').map(Number);
    const [year2, w2] = week2.split('-W').map(Number);

    return (year1 - year2) * 52 + (w1 - w2);
  }

  /**
   * Calculate difference between two months
   */
  private static getMonthDifference(month1: string, month2: string): number {
    const [year1, m1] = month1.split('-').map(Number);
    const [year2, m2] = month2.split('-').map(Number);

    return (year1 - year2) * 12 + (m1 - m2);
  }

  // ==================== ANALYTICS & REPORTING ====================

  /**
   * Get habit statistics
   */
  static async getHabitStats(habitId: number): Promise<{
    totalDays: number;
    completedDays: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    const habit = await this.getHabitById(habitId);
    const completions = await this.getHabitCompletions(habitId);

    if (!habit) {
      return {
        totalDays: 0,
        completedDays: 0,
        completionRate: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    const completedDays = completions.filter((c) => c.completed).length;
    const totalDays = completions.length;
    const completionRate =
      totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    return {
      totalDays,
      completedDays,
      completionRate: Math.round(completionRate * 100) / 100,
      currentStreak: habit.streak,
      longestStreak: this.calculateLongestStreak(completions, habit.frequency),
    };
  }

  /**
   * Calculate longest streak ever achieved
   */
  private static calculateLongestStreak(
    completions: HabitCompletion[],
    frequency: 'daily' | 'weekly' | 'monthly'
  ): number {
    if (completions.length === 0) return 0;

    const sortedCompletions = completions
      .filter((c) => c.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedCompletions.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedCompletions.length; i++) {
      const prevDate = new Date(sortedCompletions[i - 1].date);
      const currDate = new Date(sortedCompletions[i].date);

      let isConsecutive = false;

      if (frequency === 'daily') {
        const dayDiff = Math.floor(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        isConsecutive = dayDiff === 1;
      } else if (frequency === 'weekly') {
        const weekDiff = this.getWeekDifference(
          this.getWeekKey(currDate),
          this.getWeekKey(prevDate)
        );
        isConsecutive = weekDiff === 1;
      } else if (frequency === 'monthly') {
        const monthDiff = this.getMonthDifference(
          currDate.toISOString().slice(0, 7),
          prevDate.toISOString().slice(0, 7)
        );
        isConsecutive = monthDiff === 1;
      }

      if (isConsecutive) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }
}
