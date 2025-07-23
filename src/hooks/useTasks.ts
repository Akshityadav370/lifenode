import { Task } from '@/db/data-types';
import { TaskService } from '@/db/services/task-service';
import { useCallback, useEffect, useState } from 'react';

export const useMonthlyTasks = (month: string) => {
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Group tasks by date for efficient lookup
  const tasksByDate = useCallback((newTasks: Task[]) => {
    return newTasks.reduce((acc: { [key: string]: Task[] }, task) => {
      const dateKey = task.createdAt;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
      return acc;
    }, {});
  }, []);

  const loadMonthlyTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tasks = await TaskService.getAllTasksForMonth(month);
      const tasksFiltered = tasksByDate(tasks);
      setTasks(tasksFiltered);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load monthly tasks'
      );
    }
  }, [month]);

  useEffect(() => {
    loadMonthlyTasks();
  }, [loadMonthlyTasks]);

  return {
    tasks,
    setTasks,
    loading,
    error,
  };
};
