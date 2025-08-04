import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitCompletion } from '../db/data-types';
import { HabitService } from '@/db/services/habit-service';

// ==================== HABIT STATISTICS HOOK ====================

export const useHabitStats = (habitId: number | null) => {
  const [stats, setStats] = useState<{
    totalDays: number;
    completedDays: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!habitId) {
      setStats(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const habitStats = await HabitService.getHabitStats(habitId);
      setStats(habitStats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load habit statistics'
      );
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    loadStats,
  };
};

// ==================== HABIT COMPLETION HISTORY HOOK ====================

export const useHabitHistory = (habitId: number | null) => {
  const [completions, setCompletions] = useState<
    Array<{ date: string; completed: boolean }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!habitId) {
      setCompletions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const history = await HabitService.getHabitCompletions(habitId);
      setCompletions(
        history.map((h) => ({ date: h.date, completed: h.completed }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load habit history'
      );
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    completions,
    loading,
    error,
    loadHistory,
  };
};

// ==================== MONTH'S HABITS HOOK ====================

export const useMonthlyHabits = (month: string) => {
  const [habits, setHabits] = useState<
    Array<Habit & { completions: Record<string, HabitCompletion> }>
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMonthlyHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const monthlyHabits = await HabitService.getHabitsForMonth(month);
      // console.log('monthly habits', monthlyHabits);
      setHabits(monthlyHabits);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load monthly habits'
      );
    } finally {
      setLoading(false);
    }
  }, [month]);

  const toggleHabitCompletion = useCallback(
    async (habitId: number, date: string) => {
      try {
        const res = await HabitService.toggleHabitCompletion(
          habitId,
          date,
          month
        );

        // Update local state efficiently
        setHabits((prev) =>
          prev.map((habit) =>
            habit.id === habitId
              ? {
                  ...habit,
                  streak: res.updatedStreak,
                  completions: {
                    ...habit.completions,
                    [date]: res.updatedCompletion,
                  },
                }
              : habit
          )
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to toggle habit completion'
        );
        throw err;
      }
    },
    []
  );

  const createHabit = useCallback(
    async (habitData: {
      name: string;
      frequency: 'daily' | 'weekly' | 'monthly';
      month: string;
    }) => {
      try {
        const newHabit = await HabitService.createHabit(habitData);
        setHabits((prev) => [...prev, { ...newHabit, completions: {} }]);
        return newHabit;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create habit');
        throw err;
      }
    },
    []
  );

  const deleteHabit = useCallback(async (habitId: number) => {
    try {
      const success = await HabitService.deleteHabit(habitId);
      if (success) {
        setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete habit');
      throw err;
    }
  }, []);

  const getCompletionStatus = useCallback(
    (habitId: number, date: string): boolean => {
      const habit = habits.find((h) => h.id === habitId);
      return habit?.completions[date]?.completed || false;
    },
    [habits]
  );

  const getMonthStats = useCallback(() => {
    const daysInMonth = new Date(
      parseInt(month.split('-')[0]),
      parseInt(month.split('-')[1]),
      0
    ).getDate();
    const monthStats: Record<string, { completed: number; total: number }> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${month}-${day.toString().padStart(2, '0')}`;
      const completedCount = habits.filter(
        (habit) => habit.completions[date]?.completed
      ).length;
      monthStats[date] = {
        completed: completedCount,
        total: habits.length,
      };
    }
    // console.log('monthStats', monthStats);
    return monthStats;
  }, [habits, month]);

  useEffect(() => {
    loadMonthlyHabits();
    getMonthStats();
  }, [month]);

  return {
    habits,
    loading,
    error,
    loadMonthlyHabits,
    toggleHabitCompletion,
    createHabit,
    deleteHabit,
    getCompletionStatus,
    getMonthStats,
  };
};

// ==================== MONTH'S LONGEST STREAKS ====================
export const useMonthlyHabitsWithStreaks = (month: string) => {
  const [habitsWithStreaks, setHabitsWithStreaks] = useState<
    Array<{
      habitData: Habit & { completions: Record<string, HabitCompletion> };
      currentStreak: number;
      longestStreak: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStreaks, setActiveStreaks] = useState<
    Array<{
      habitData: Habit & { completions: Record<string, HabitCompletion> };
      currentStreak: number;
      longestStreak: number;
    }>
  >([]);

  const loadMonthlyHabitsWithStreaks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const habits = await HabitService.getHabitsForMonthWithStreaks(month);
      setHabitsWithStreaks(habits);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load monthly habits with streaks'
      );
    } finally {
      setLoading(false);
    }
  }, [month]);

  const loadActiveStreaks = useCallback(() => {
    const habitsWithActiveStreaks = habitsWithStreaks.filter(
      (habit) => habit.currentStreak === habit.longestStreak
    );
    setActiveStreaks(habitsWithActiveStreaks);
  }, [habitsWithStreaks]);

  useEffect(() => {
    loadMonthlyHabitsWithStreaks();
  }, [loadMonthlyHabitsWithStreaks, month]);

  useEffect(() => {
    loadActiveStreaks();
  }, [month, habitsWithStreaks]);

  return {
    habitsWithStreaks,
    activeStreaks,
    loading,
    error,
    loadMonthlyHabitsWithStreaks,
    loadActiveStreaks,
  };
};
