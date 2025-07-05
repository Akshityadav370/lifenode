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
  // const [habits, setHabits] = useState<
  //   Array<Habit & { completions: Record<string, HabitCompletion> }>
  // >([
  //   {
  //     id: 1,
  //     name: 'Exercise',
  //     frequency: 'daily',
  //     streak: 5,
  //     createdAt: '2024-03-01',
  //     completions: {
  //       '2024-03-01': {
  //         id: 1,
  //         habitId: 1,
  //         date: '2024-03-01',
  //         month: '2024-03',
  //         completed: true,
  //       },
  //       '2024-03-02': {
  //         id: 2,
  //         habitId: 1,
  //         date: '2024-03-02',
  //         month: '2024-03',
  //         completed: false,
  //       },
  //     },
  //   },
  //   {
  //     id: 2,
  //     name: 'Read Book',
  //     frequency: 'daily',
  //     streak: 3,
  //     createdAt: '2024-03-01',
  //     completions: {
  //       '2024-03-01': {
  //         id: 5,
  //         habitId: 2,
  //         date: '2024-03-01',
  //         completed: true,
  //         month: '2024-03',
  //       },
  //     },
  //   },
  //   {
  //     id: 3,
  //     name: 'Meditate',
  //     frequency: 'daily',
  //     streak: 2,
  //     createdAt: '2024-03-01',
  //     completions: {
  //       '2024-03-02': {
  //         id: 8,
  //         habitId: 3,
  //         date: '2024-03-02',
  //         month: '2024-03',
  //         completed: true,
  //       },
  //     },
  //   },
  // ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMonthlyHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      //   const monthlyHabits = await HabitService.getHabitsForMonth(month);
      //   setHabits(monthlyHabits);
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
        const updatedCompletion = await HabitService.toggleHabitCompletion(
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
                  completions: {
                    ...habit.completions,
                    [date]: updatedCompletion,
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

    return monthStats;
  }, [habits, month]);

  useEffect(() => {
    loadMonthlyHabits();
  }, [loadMonthlyHabits]);

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
