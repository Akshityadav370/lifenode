import { Task } from '../data-types';
import { dbPromise } from '../indexedDB';

export class TaskService {
  // ==================== TASK CRUD OPERATIONS ====================

  /**
   * Create a new task
   */
  static async createTask(
    taskData: Omit<Task, 'id' | 'createdAt' | 'month'>,
    dayId: string,
    month: string
  ): Promise<Task> {
    const db = await dbPromise;

    const newTask: Omit<Task, 'id'> = {
      ...taskData,
      createdAt: dayId, // "YYYY-MM-DD" format
      month, // "YYYY-MM" format
    };

    const id = await db.add('tasks', newTask as Task);
    return { ...newTask, id } as Task;
  }

  /**
   * Get a specific task by ID
   */
  static async getTaskById(id: number): Promise<Task | undefined> {
    const db = await dbPromise;
    return await db.get('tasks', id);
  }

  /**
   * Delete a task
   */
  static async deleteTask(id: number): Promise<boolean> {
    const db = await dbPromise;

    try {
      // Delete the task itself
      await db.delete('tasks', id);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  /**
   * Get all tasks for a specific month
   */
  static async getAllTasksForMonth(month: string): Promise<Task[]> {
    const db = await dbPromise;

    try {
      const tasks = await db.getAllFromIndex('tasks', 'month', month);
      return tasks;
    } catch (error) {
      console.error('Error fetching monthly tasks:', error);
      return [];
    }
  }

  /**
   * Update an existing task
   */
  static async updateTask(updatedTask: Task, dayId: string): Promise<boolean> {
    const db = await dbPromise;

    try {
      const taskToUpdate = {
        ...updatedTask,
        createdAt: dayId,
      };

      await db.put('tasks', taskToUpdate);
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  }
}
