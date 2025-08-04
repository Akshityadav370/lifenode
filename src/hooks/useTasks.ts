import { Task } from '@/db/data-types';
import { TaskService } from '@/db/services/task-service';
import { addDays, endOfWeek, format, parseISO, startOfWeek } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useMonthlyTasks = (month: string) => {
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const currentDay = format(currentDate, 'yyyy-MM-dd');
  const tomorrowDay = format(addDays(currentDate, 1), 'yyyy-MM-dd');

  const todayTasks = useMemo(
    () => tasks[currentDay] || [],
    [tasks, currentDay]
  );

  const tomorrowTasks = useMemo(
    () => tasks[tomorrowDay] || [],
    [tasks, tomorrowDay]
  );

  const weeklyTasks = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const result: Task[] = [];

    for (const [date, dayTasks] of Object.entries(tasks)) {
      const taskDate = parseISO(date);
      if (taskDate >= weekStart && taskDate <= weekEnd) {
        result.push(...dayTasks);
      }
    }

    return result;
  }, [tasks, currentDate]);

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
    } finally {
      setLoading(false);
    }
  }, [month]);

  const addNewTask = useCallback(
    async (
      newTask: Omit<Task, 'id' | 'createdAt' | 'month'>,
      dayId: string
    ) => {
      try {
        const addedTask = await TaskService.createTask(newTask, dayId, month);

        setTasks((prevTasks) => {
          const existingTasksOnDayId = prevTasks[dayId] || [];
          return {
            ...prevTasks,
            [dayId]: [...existingTasksOnDayId, addedTask],
          };
        });

        return addedTask;
      } catch (error) {
        console.error('Error creating task:', error);
        setError('Failed to create task');
        return null;
      }
    },
    []
  );

  const deleteTask = useCallback(async (taskId: number, dayId: string) => {
    try {
      const success = await TaskService.deleteTask(taskId);

      if (success) {
        setTasks((prevTasks) => {
          const existingTasks = prevTasks[dayId] || [];
          const updatedTasks = existingTasks.filter(
            (task) => task.id !== taskId
          );

          if (updatedTasks.length === 0) {
            const { [dayId]: removed, ...rest } = prevTasks;
            return rest;
          }

          return {
            ...prevTasks,
            [dayId]: updatedTasks,
          };
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
      return false;
    }
  }, []);

  const updateTask = useCallback(async (updatedTask: Task, dayId: string) => {
    try {
      const success = await TaskService.updateTask(updatedTask, dayId);

      if (success) {
        setTasks((prevTasks) => {
          const existingTasks = prevTasks[dayId] || [];
          const updatedTasks = existingTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          );

          return {
            ...prevTasks,
            [dayId]: updatedTasks,
          };
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
      return false;
    }
  }, []);

  useEffect(() => {
    loadMonthlyTasks();
  }, [loadMonthlyTasks]);

  return {
    tasks,
    todayTasks,
    tomorrowTasks,
    weeklyTasks,
    setTasks,
    loading,
    error,
    addNewTask,
    deleteTask,
    updateTask,
  };
};
