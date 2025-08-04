import { useMonthlyHabitsWithStreaks } from '@/hooks/useHabits';
import { format } from 'date-fns';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
  Target,
  Bell,
  Plus,
  Flame,
} from 'lucide-react';
import { useState } from 'react';

const mockTasks = [];

const mockReminders = [
  {
    id: 1,
    title: 'Drink Water',
    message: 'Stay hydrated!',
    intervalMinutes: 60,
    nextTime: '2:30 PM',
  },
  {
    id: 2,
    title: 'Eye Break',
    message: '20-20-20 rule',
    intervalMinutes: 20,
    nextTime: '2:15 PM',
  },
  {
    id: 3,
    title: 'Stand Up',
    message: 'Stretch your legs',
    intervalMinutes: 45,
    nextTime: '2:45 PM',
  },
];

const Dashboard = () => {
  const todayTasks = mockTasks;
  const todayReminders = mockReminders;
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), 'yyyy-MM')
  );

  const { activeStreaks } = useMonthlyHabitsWithStreaks(currentMonth);
  console.log('activeStreaks', activeStreaks);
  return (
    <div className="flex flex-col gap-2">
      {/* Streaks Here */}
      {/* <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h2
            className="text-sm font-semibold"
            style={{ color: 'var(--text)' }}
          >
            Active Streaks
          </h2>
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--surface)',
            }}
          >
            {activeStreaks.length}
          </span>
        </div>

        {activeStreaks.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {activeStreaks.map((streak) => (
              <div
                key={streak.id}
                className="p-3 rounded-md border transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--text)' }}
                  >
                    {streak.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {streak.currentStreak >= 7 && <span>🔥</span>}
                    <span
                      className="font-bold text-lg"
                      style={{ color: 'var(--accent)' }}
                    >
                      {streak.currentStreak}
                    </span>
                  </div>
                </div>
                <div className="text-xs" style={{ color: 'var(--textMuted)' }}>
                  Best: {streak.longestStreak} days
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Target
              className="w-8 h-8 mx-auto mb-2"
              style={{ color: 'var(--textMuted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--textMuted)' }}>
              No active streaks
            </p>
            <p className="text-xs" style={{ color: 'var(--textMuted)' }}>
              Start a habit to build streaks!
            </p>
          </div>
        )}
      </div> */}
      {activeStreaks.length === 0 ? (
        <div className="flex-1 overflow-scroll mask-fade-right pr-16 hide-scrollbar">
          <div className="flex w-fit gap-2">
            {[...activeStreaks, ...activeStreaks, ...activeStreaks].map(
              (habitStreak) => (
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
              )
            )}
          </div>
        </div>
      ) : (
        <div
          className="flex text-center rounded-sm justify-center"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--textMuted)' }}>
            No active streaks.
          </p>
          <p className="text-sm" style={{ color: 'var(--textMuted)' }}>
            Start a habit to build streaks!
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {/* Tasks here */}
        <div
          className="flex-1 p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2
              className="w-4 h-4"
              style={{ color: 'var(--accent)' }}
            />
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--text)' }}
            >
              Today's Tasks
            </h2>
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--surface)',
              }}
            >
              {todayTasks.filter((task) => !task.completed).length}
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-2 rounded-md border transition-all ${
                    task.completed ? 'opacity-60' : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: task.completed
                      ? 'var(--border)'
                      : 'var(--border)',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 cursor-pointer ${
                        task.completed ? 'bg-green-500 border-green-500' : ''
                      }`}
                      style={{
                        borderColor: task.completed
                          ? '#10b981'
                          : 'var(--border)',
                      }}
                    >
                      {task.completed && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
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
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle2
                  className="w-8 h-8 mx-auto mb-2"
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
          className="flex-1 p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--text)' }}
            >
              Active Reminders
            </h2>
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--surface)',
              }}
            >
              {todayReminders.length}
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {todayReminders.length > 0 ? (
              todayReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-2 rounded-md border hover:opacity-80 transition-colors"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--text)' }}
                    >
                      {reminder.title}
                    </span>
                    <div
                      className="flex items-center gap-1"
                      style={{ color: 'var(--accent)' }}
                    >
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {reminder.nextTime}
                      </span>
                    </div>
                  </div>
                  {reminder.message && (
                    <p
                      className="text-xs mb-1"
                      style={{ color: 'var(--textMuted)' }}
                    >
                      {reminder.message}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
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
                  className="w-8 h-8 mx-auto mb-2"
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
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--surface)',
            }}
          >
            Coming Soon
          </span>
        </div>

        <div
          className="text-center py-8 border-2 border-dashed rounded-lg"
          style={{ borderColor: 'var(--border)' }}
        >
          <MessageSquare
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: 'var(--textMuted)' }}
          />
          <h3
            className="text-base font-medium mb-2"
            style={{ color: 'var(--text)' }}
          >
            Chat History Coming Soon!
          </h3>
          <p className="text-sm" style={{ color: 'var(--textMuted)' }}>
            Your conversation history with the AI assistant will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
