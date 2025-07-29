import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useMonthlyTasks } from '@/hooks/useTasks';
import { Task } from '@/db/data-types';

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

const formatDate = (date: Date, format: string) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (format) {
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'yyyy-MM':
      return `${year}-${month}`;
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
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  const year = currentDate.getFullYear();
  const monthString = formatDate(currentDate, 'yyyy-MM');
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayIndex = firstDayOfMonth.getDay();

  const overFlowDays = daysInMonth.length + startingDayIndex - 5 * 7;

  const {
    tasks: tasksByDate,
    setTasks,
    loading: loadingTasks,
    error: errorFetchingTasksByDate,
    addNewTask,
    updateTask,
    deleteTask,
  } = useMonthlyTasks(monthString);

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

  const handleTaskToggle = (task: Task) => {
    if (!task) return;
    const updatedTask = { ...task, completed: !task.completed };
    updateTask(updatedTask, selectedDate!);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim() || !selectedDate) return;

    if (editingTask) {
      // Update existing task
      const updatedTask: Task = {
        ...editingTask,
        title: newTask.title,
        description: newTask.description,
      };
      updateTask(updatedTask, selectedDate);
      setEditingTask(null);
    } else {
      // Add new task
      const newTaskObj: Omit<Task, 'id' | 'createdAt' | 'month'> = {
        title: newTask.title,
        description: newTask.description,
        completed: false,
      };
      addNewTask(newTaskObj, selectedDate);
    }

    // Reset form and go back to task list
    setNewTask({ title: '', description: '' });
    setShowTaskForm(false);
    // TODO: Add toast notifications
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTask(taskId, selectedDate!);
    // TODO: Add toast notifications
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({ title: task.title, description: task.description || '' });
    setShowTaskForm(true);
  };

  const openTaskModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowTaskModal(true);
  };

  const closeModal = () => {
    setShowTaskModal(false);
    setShowTaskForm(false);
    setEditingTask(null);
    setNewTask({ title: '', description: '' });
    setSelectedDate(null);
  };

  const openAddTaskForm = () => {
    setEditingTask(null);
    setNewTask({ title: '', description: '' });
    setShowTaskForm(true);
  };

  const totalCellsUsed =
    Math.max(0, overFlowDays) +
    Math.max(0, startingDayIndex - Math.max(0, overFlowDays)) +
    (overFlowDays > 0 ? daysInMonth.length - overFlowDays : daysInMonth.length);
  const totalGridCells = Math.ceil(totalCellsUsed / 7) * 7;
  const remainingCells = totalGridCells - totalCellsUsed;

  if (loadingTasks) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-xl">Loading ...</p>
      </div>
    );
  }

  if (errorFetchingTasksByDate) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-xl">Error</p>
      </div>
    );
  }

  const selectedDateTasks = selectedDate ? tasksByDate[selectedDate] || [] : [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 pb-2 justify-center">
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
                      backgroundColor: 'var(--surface)',
                      borderWidth: isCurrentDay ? '2px' : '1px',
                    }}
                    onClick={() => openTaskModal(dateKey)}
                  >
                    <div className="flex flex-col h-full w-full">
                      <div
                        className={`text-xs font-medium mb-1`}
                        style={{
                          color: isCurrentDay
                            ? 'var(--primary)'
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
                    className={`w-full aspect-square size-20 border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md hover:scale-104`}
                    style={{
                      borderColor: isCurrentDay
                        ? 'var(--primary)'
                        : 'var(--border)',
                      backgroundColor: 'var(--surface)',
                      borderWidth: isCurrentDay ? '2px' : '1px',
                    }}
                    onClick={() => openTaskModal(dateKey)}
                  >
                    <div className="flex relative flex-col h-full w-full">
                      <div
                        className={`text-xs font-medium mb-1`}
                        style={{
                          color: isCurrentDay
                            ? 'var(--primary)'
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
                            className={`text-xs px-1 rounded truncate w-full transition-all`}
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
                      </div>
                      {dayTasks.length > 2 && (
                        <div
                          className="text-xs absolute top-0 right-1 text-center font-medium"
                          style={{ color: 'var(--accent)' }}
                        >
                          +{dayTasks.length - 2}
                        </div>
                      )}
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

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-lg p-6 w-full max-w-md mx-4 border shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            {!showTaskForm ? (
              // Task List View
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    <span style={{ color: 'var(--primary)' }}>
                      {selectedDate &&
                        formatDate(new Date(selectedDate), 'MMMM d, yyyy')}
                    </span>
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={openAddTaskForm}
                      className="w-full rounded-full p-2 font-medium transition-all hover:shadow-md flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--surface)',
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.transform = 'translateY(0)';
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={closeModal}
                      className="p-1 bg-transparent hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--textMuted)' }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-4">
                  {selectedDateTasks.length === 0 ? (
                    <div
                      className="text-center py-8"
                      style={{ color: 'var(--textMuted)' }}
                    >
                      No tasks for this day
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex gap-3 p-1 px-3 rounded-lg border"
                          style={{
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                          }}
                        >
                          <button
                            onClick={() => handleTaskToggle(task)}
                            className="relative transition-all items-center content-center size-5 my-auto border focus-within:outline-none"
                            style={{
                              borderColor: task.completed
                                ? 'var(--success)'
                                : 'var(--border)',
                              backgroundColor: 'transparent',
                            }}
                          >
                            {task.completed && (
                              <Check
                                className="absolute -top-0 left-1 size-5"
                                style={{ color: 'var(--success)' }}
                              />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div
                              className={`font-semibold ${
                                task.completed ? 'line-through opacity-70' : ''
                              }`}
                              style={{ color: 'var(--text)' }}
                            >
                              {task.title}
                            </div>
                            {task.description && (
                              <div
                                className={`${
                                  task.completed
                                    ? 'line-through opacity-70'
                                    : ''
                                }`}
                                style={{ color: 'var(--textMuted)' }}
                              >
                                {task.description}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-1 hover:opacity-70 bg-transparent transition-opacity"
                              style={{ color: 'var(--primary)' }}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 hover:opacity-70 bg-transparent transition-opacity"
                              style={{ color: 'var(--error)' }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Task Form View
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    {editingTask ? 'Edit Task' : 'Add Task'} for{' '}
                    <span style={{ color: 'var(--primary)' }}>
                      {selectedDate &&
                        formatDate(new Date(selectedDate), 'MMMM d, yyyy')}
                    </span>
                  </h3>
                  <button
                    onClick={() => setShowTaskForm(false)}
                    className="p-1 bg-transparent hover:opacity-70 transition-opacity"
                    style={{
                      color: 'var(--textMuted)',
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--text)' }}
                    >
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full p-3 border rounded-md transition-all focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--background)',
                        color: 'var(--text)',
                        borderColor: 'var(--border)',
                      }}
                      onFocus={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.style.borderColor = 'var(--primary)';
                        target.style.boxShadow = `0 0 0 2px rgba(14, 165, 233, 0.1)`;
                      }}
                      onBlur={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.style.borderColor = 'var(--border)';
                        target.style.boxShadow = 'none';
                      }}
                      placeholder="Enter task title"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--text)' }}
                    >
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
                      className="w-full p-3 border rounded-md transition-all focus:outline-none focus:ring-2 resize-none"
                      style={{
                        backgroundColor: 'var(--background)',
                        color: 'var(--text)',
                        borderColor: 'var(--border)',
                      }}
                      onFocus={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.borderColor = 'var(--primary)';
                        target.style.boxShadow = `0 0 0 2px rgba(14, 165, 233, 0.1)`;
                      }}
                      onBlur={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.borderColor = 'var(--border)';
                        target.style.boxShadow = 'none';
                      }}
                      placeholder="Enter task description (optional)"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddTask}
                    disabled={!newTask.title.trim()}
                    className="flex-1 py-2 px-4 rounded-md font-medium transition-all hover:shadow-md disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: !newTask.title.trim()
                        ? 'var(--secondary)'
                        : 'var(--primary)',
                      color: 'var(--surface)',
                      opacity: !newTask.title.trim() ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (newTask.title.trim()) {
                        const target = e.target as HTMLButtonElement;
                        target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = 'translateY(0)';
                    }}
                  >
                    {editingTask ? 'Update Task' : 'Add Task'}
                  </button>
                  <button
                    onClick={() => {
                      setShowTaskForm(false);
                      setNewTask({ title: '', description: '' });
                      setEditingTask(null);
                    }}
                    className="flex-1 py-2 px-4 rounded-md font-medium transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: 'var(--background)',
                      color: 'var(--text)',
                      border: `1px solid var(--border)`,
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.backgroundColor = 'var(--border)';
                      target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.backgroundColor = 'var(--background)';
                      target.style.transform = 'translateY(0)';
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendar;
