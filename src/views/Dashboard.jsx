import { useMonthlyHabitsWithStreaks } from '@/hooks/useHabits';
import { useMonthlyTasks } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { CheckCircle2, MessageSquare, Bell, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AlarmService } from '@/db/services/alarm-service';
import { useChatService } from '@/hooks/useChatService';

const Dashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), 'yyyy-MM')
  );
  const [taskView, setTaskView] = useState('today');
  const [alarms, setAlarms] = useState([]);
  const [chats, setChats] = useState([]);

  const { activeStreaks } = useMonthlyHabitsWithStreaks(currentMonth);
  const { todayTasks, tomorrowTasks, weeklyTasks, updateTask, deleteTask } =
    useMonthlyTasks(currentMonth);
  const { fetchAllChats, clearChatHistory } = useChatService();

  const getCurrentTasks = () => {
    switch (taskView) {
      case 'today':
        return todayTasks;
      case 'tomorrow':
        return tomorrowTasks;
      case 'weekly':
        return weeklyTasks;
      default:
        return todayTasks;
    }
  };

  const getTaskViewTitle = () => {
    switch (taskView) {
      case 'today':
        return "Today's Tasks";
      case 'tomorrow':
        return "Tomorrow's Tasks";
      case 'weekly':
        return 'Weekly Tasks';
      default:
        return "Today's Tasks";
    }
  };

  const currentTasks = getCurrentTasks();

  const handleToggleTask = async (task) => {
    const updatedTask = {
      ...task,
      completed: !task.completed,
    };

    await updateTask(updatedTask, task.createdAt);
  };

  const handleDeleteTask = async (taskId, taskCreatedAt) => {
    const dayId = taskCreatedAt;
    await deleteTask(taskId, dayId);
  };

  const handleClearChat = async (problemName) => {
    await clearChatHistory(problemName);
    const allChats = await fetchAllChats();
    setChats(allChats.reverse());
  };

  useEffect(() => {
    const fetchAlarms = async () => {
      const fetchedAlarms = await AlarmService.getAlarms();
      setAlarms(fetchedAlarms);
    };
    const loadChats = async () => {
      const allChats = await fetchAllChats();
      console.log('allChats', allChats);
      setChats(allChats.reverse());
    };
    fetchAlarms();
    loadChats();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {activeStreaks && activeStreaks.length !== 0 ? (
        // TODO: generalize the Streaks and this DashBoard component scroller
        <div className="flex-1 overflow-scroll mask-fade-right pr-16 hide-scrollbar">
          <div className="flex w-fit gap-2">
            {activeStreaks.map((habitStreak) => (
              <div
                key={habitStreak.habitData.id}
                className="flex gap-4 p-1 px-2 items-center rounded-lg shadow border"
                style={{
                  borderColor: 'var(--accent)',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <span>{habitStreak.habitData.name}</span>

                <div className="flex items-baseline gap-1">
                  <span>{habitStreak.longestStreak}</span>
                  <span className="text-xs">{'🔥'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="flex text-center rounded-sm justify-center p-1"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-xs" style={{ color: 'var(--textMuted)' }}>
            No active streaks...
          </p>
          <p className="text-xs" style={{ color: 'var(--textMuted)' }}>
            Start a habit to build streaks!
          </p>
        </div>
      )}

      <div className="flex gap-3 my-1">
        <div
          className="flex-1 p-2 rounded-lg"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Tasks header */}
          <div className="flex items-center mb-2">
            <CheckCircle2
              className="w-4 h-4 mr-2"
              style={{ color: 'var(--accent)' }}
            />
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--text)' }}
            >
              {getTaskViewTitle()}
            </h2>
            <span
              className="px-1 py-1 text-sm font-medium ml-1"
              style={{
                color: 'var(--text)',
              }}
            >
              [{currentTasks.filter((task) => !task.completed).length}]
            </span>
            <div className="flex gap-1 ml-auto">
              {['today', 'tomorrow', 'weekly'].map((view) => (
                <button
                  key={view}
                  onClick={() => setTaskView(view)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    taskView === view ? 'font-medium' : 'hover:opacity-70'
                  }`}
                  style={{
                    backgroundColor:
                      taskView === view ? 'var(--accent)' : 'transparent',
                    color:
                      taskView === view ? 'var(--surface)' : 'var(--textMuted)',
                  }}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {/* Task Body */}
          <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
            {currentTasks.length > 0 ? (
              currentTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-2 px-4 rounded-md border transition-all ${
                    task.completed ? 'opacity-60' : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: task.completed
                      ? 'var(--border)'
                      : 'var(--border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 cursor-pointer ${
                        task.completed ? '' : ''
                      }`}
                      style={{
                        borderColor: task.completed
                          ? 'transparent'
                          : 'var(--border)',
                      }}
                      onClick={() => handleToggleTask(task)}
                    >
                      {task.completed && (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleToggleTask(task)}
                    >
                      <p
                        className={`text-sm font-semibold ${
                          task.completed ? 'line-through' : ''
                        }`}
                        style={{
                          color: task.completed
                            ? 'var(--textMuted)'
                            : 'var(--text)',
                        }}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <div
                          className={`${
                            task.completed ? 'line-through opacity-70' : ''
                          }`}
                          style={{ color: 'var(--textMuted)' }}
                        >
                          {task.description}
                        </div>
                      )}
                    </div>
                    <div
                      onClick={() => handleDeleteTask(task.id, task.createdAt)}
                      className="group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded cursor-pointer"
                      title="Delete task"
                      style={{
                        color: 'var(--error)',
                      }}
                    >
                      <Trash2 className="size-3" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle2
                  className="w-6 h-6 mx-auto mb-2"
                  style={{ color: 'var(--textMuted)' }}
                />
                <p className="text-sm" style={{ color: 'var(--textMuted)' }}>
                  No tasks for today
                </p>
                <p className="text-xs" style={{ color: 'var(--textMuted)' }}>
                  You're all caught up!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reminders here */}
        <div
          className="flex-1 p-2 rounded-lg"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Reminder header */}
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--text)' }}
            >
              Active Reminders
            </h2>
            <span
              className="px-1 py-1 text-sm font-medium"
              style={{
                color: 'var(--text)',
              }}
            >
              [{alarms.length}]
            </span>
          </div>

          {/* Reminder Body */}
          <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
            {alarms.length > 0 ? (
              alarms.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-2 px-3 flex justify-between rounded-md border hover:opacity-80 transition-colors"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex flex-col justify-between mb-1">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--text)' }}
                    >
                      {reminder.title}
                    </span>
                    {reminder.message && (
                      <p
                        className="text-xs mb-1"
                        style={{ color: 'var(--textMuted)' }}
                      >
                        {reminder.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-between">
                    {reminder.fromTime && reminder.toTime && (
                      <span>
                        {reminder.fromTime} to {reminder.toTime}
                      </span>
                    )}
                    <span
                      className="px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--surface)',
                      }}
                    >
                      Every {reminder.intervalMinutes}m
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Bell
                  className="w-6 h-6 mx-auto mb-2"
                  style={{ color: 'var(--textMuted)' }}
                />
                <p className="text-sm" style={{ color: 'var(--textMuted)' }}>
                  No active reminders
                </p>
                <p className="text-xs" style={{ color: 'var(--textMuted)' }}>
                  Set up reminders to stay on track!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat history here */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare
            className="w-4 h-4"
            style={{ color: 'var(--accent)' }}
          />
          <h2
            className="text-sm font-semibold"
            style={{ color: 'var(--text)' }}
          >
            Chat History
          </h2>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
          {chats.length > 0 ? (
            chats.map((chatName) => (
              <div
                key={chatName}
                className="flex items-center justify-between p-2 px-3 rounded-md border hover:opacity-80 transition-colors"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                }}
              >
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--text)' }}
                >
                  {chatName}
                </span>

                <button
                  onClick={() => handleClearChat(chatName)}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                  title="Delete chat"
                  style={{ color: 'var(--error)' }}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <MessageSquare
                className="w-6 h-6 mx-auto mb-2"
                style={{ color: 'var(--textMuted)' }}
              />
              <p className="text-sm" style={{ color: 'var(--textMuted)' }}>
                No chat history yet
              </p>
              <p className="text-xs" style={{ color: 'var(--textMuted)' }}>
                Start solving a problem to see it here!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
