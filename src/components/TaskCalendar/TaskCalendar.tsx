import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, Clock, X } from 'lucide-react';
import { useMonthlyTasks } from '@/hooks/useTasks';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface Task {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  completed: boolean;
}

// Utility functions for date handling
const formatDate = (date: Date, format: string) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (format) {
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'MMMM yyyy':
      return `${MONTHS[date.getMonth()]} ${year}`;
    case 'MMM d':
      return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
    case 'MMMM d, yyyy':
      return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${year}`;
    default:
      return date.toDateString();
  }
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isSameMonth = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
};

const getDaysInMonth = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];

  for (
    let date = new Date(firstDay);
    date <= lastDay;
    date.setDate(date.getDate() + 1)
  ) {
    days.push(new Date(date));
  }

  return days;
};

const TaskCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayIndex = firstDayOfMonth.getDay();

  const overFlowDays = daysInMonth.length + startingDayIndex - 5 * 7;

  const {
    tasks: tasksByDate,
    setTasks: setTasksByDate,
    loading,
    error,
  } = useMonthlyTasks(month.toString());

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  //   const handleTaskToggle = (taskId: number) => {
  //     setTasks((prev) =>
  //       prev.map((task) =>
  //         task.id === taskId ? { ...task, completed: !task.completed } : task
  //       )
  //     );
  //   };

  //   const handleAddTask = () => {
  //     if (!newTask.title.trim() || !selectedDate) return;

  //     const newTaskObj: Task = {
  //       id: Date.now(), // In real app, this would be handled by your DB
  //       title: newTask.title,
  //       description: newTask.description,
  //       createdAt: selectedDate,
  //       completed: false,
  //     };

  //     setTasks((prev) => [...prev, newTaskObj]);
  //     setNewTask({ title: '', description: '' });
  //     setShowTaskForm(false);
  //   };

  //   const handleDeleteTask = (taskId: number) => {
  //     setTasks((prev) => prev.filter((task) => task.id !== taskId));
  //   };

  const openTaskForm = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowTaskForm(true);
  };

  // Calculate the total cells used and remaining cells needed
  const totalCellsUsed =
    Math.max(0, overFlowDays) +
    Math.max(0, startingDayIndex - Math.max(0, overFlowDays)) +
    (overFlowDays > 0 ? daysInMonth.length - overFlowDays : daysInMonth.length);
  const totalGridCells = Math.ceil(totalCellsUsed / 7) * 7; // Round up to next multiple of 7
  const remainingCells = totalGridCells - totalCellsUsed;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 pb-2">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-[2px] hover:opacity-80 rounded-full transition-opacity"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <ChevronLeft
            className="w-2 h-2"
            style={{ color: 'var(--surface)' }}
          />
        </button>

        <h2
          className="text-sm min-w-36 font-bold"
          style={{ color: 'var(--text)' }}
        >
          <div className="flex flex-1 items-center gap-2 justify-center">
            {formatDate(currentDate, 'MMMM yyyy')}
          </div>
        </h2>

        <button
          onClick={() => navigateMonth('next')}
          className="p-[2px] hover:opacity-80 rounded-full transition-opacity"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <ChevronRight
            className="w-2 h-2"
            style={{ color: 'var(--surface)' }}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-0">
        {/* Calendar Grid */}
        <div className="">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 w-full mb-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="p-2 text-center py-2 font-semibold text-xs rounded-t-md"
                style={{
                  color: 'var(--surface)',
                  backgroundColor: 'var(--primary)',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 w-full">
            {/* Overflow days from the end of current month (rendered at the beginning) */}
            {overFlowDays > 0 &&
              Array.from({ length: overFlowDays }).map((_, index) => {
                const day = daysInMonth[daysInMonth.length - 1 - index];
                const dateKey = formatDate(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDate[dateKey] || [];
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={index}
                    className={`w-full aspect-square size-20 border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md hover:scale-105`}
                    style={{
                      borderColor: isCurrentDay
                        ? 'var(--primary)'
                        : 'var(--border)',
                      backgroundColor: isCurrentDay
                        ? 'var(--accent)'
                        : 'var(--surface)',
                      borderWidth: isCurrentDay ? '2px' : '1px',
                    }}
                    onClick={() => openTaskForm(dateKey)}
                  >
                    <div className="flex flex-col h-full w-full">
                      <div
                        className={`text-xs font-medium mb-1`}
                        style={{
                          color: isCurrentDay
                            ? 'var(--surface)'
                            : 'var(--text)',
                          fontWeight: isCurrentDay ? '700' : '500',
                        }}
                      >
                        {day.getDate()}
                      </div>

                      <div className="flex-1 space-y-1 overflow-hidden w-full">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded truncate w-full transition-all`}
                            style={{
                              backgroundColor: task.completed
                                ? 'var(--success)'
                                : 'var(--secondary)',
                              color: 'var(--surface)',
                              textDecoration: task.completed
                                ? 'line-through'
                                : 'none',
                              opacity: task.completed ? 0.7 : 1,
                            }}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div
                            className="text-xs text-center w-full font-medium"
                            style={{ color: 'var(--textMuted)' }}
                          >
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Empty cells for days before month starts */}
            {Array.from({
              length: Math.max(0, startingDayIndex - Math.max(0, overFlowDays)),
            }).map((_, index) => (
              <div
                key={`empty-start-${index}`}
                className={`w-full aspect-square size-20 border rounded-lg p-2 opacity-50`}
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)',
                  borderWidth: '1px',
                }}
              />
            ))}

            {/* Days of the month (skip the overflow days that were already rendered) */}
            {daysInMonth
              .slice(0, overFlowDays > 0 ? -overFlowDays : daysInMonth.length)
              .map((day, index) => {
                const dateKey = formatDate(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDate[dateKey] || [];
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={index}
                    className={`w-full aspect-square size-20 border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md hover:scale-105`}
                    style={{
                      borderColor: isCurrentDay
                        ? 'var(--primary)'
                        : 'var(--border)',
                      backgroundColor: isCurrentDay
                        ? 'var(--accent)'
                        : 'var(--surface)',
                      borderWidth: isCurrentDay ? '2px' : '1px',
                    }}
                    onClick={() => openTaskForm(dateKey)}
                  >
                    <div className="flex flex-col h-full w-full">
                      <div
                        className={`text-xs font-medium mb-1`}
                        style={{
                          color: isCurrentDay
                            ? 'var(--surface)'
                            : 'var(--text)',
                          fontWeight: isCurrentDay ? '700' : '500',
                        }}
                      >
                        {day.getDate()}
                      </div>

                      <div className="flex-1 space-y-1 overflow-hidden w-full">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded truncate w-full transition-all`}
                            style={{
                              backgroundColor: task.completed
                                ? 'var(--success)'
                                : 'var(--secondary)',
                              color: 'var(--surface)',
                              textDecoration: task.completed
                                ? 'line-through'
                                : 'none',
                              opacity: task.completed ? 0.7 : 1,
                            }}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div
                            className="text-xs text-center w-full font-medium"
                            style={{ color: 'var(--textMuted)' }}
                          >
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Empty cells for remaining unoccupied cells to complete the grid */}
            {Array.from({ length: remainingCells }).map((_, index) => (
              <div
                key={`empty-end-${index}`}
                className={`w-full aspect-square size-20 border rounded-lg p-2 opacity-50`}
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)',
                  borderWidth: '1px',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {/* {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Add Task for{' '}
              {selectedDate &&
                formatDate(new Date(selectedDate), 'MMMM d, yyyy')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task description (optional)"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddTask}
                disabled={!newTask.title.trim()}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Task
              </button>
              <button
                onClick={() => {
                  setShowTaskForm(false);
                  setNewTask({ title: '', description: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default TaskCalendar;
