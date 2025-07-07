import {
  useMonthlyHabits,
  useMonthlyHabitsWithStreaks,
} from '@/hooks/useHabits';
import { eachDayOfInterval, endOfMonth, format, parse } from 'date-fns';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { HabitFrequency } from '@/db/data-types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Streaks = () => {
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), 'yyyy-MM')
  );
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState<
    HabitFrequency | undefined
  >('daily');

  const {
    habits,
    loading,
    toggleHabitCompletion,
    createHabit,
    deleteHabit,
    getCompletionStatus,
  } = useMonthlyHabits(currentMonth);

  const {
    habitsWithStreaks,
    loading: loadingMonthlyDash,
    error: errorMontlyDash,
    loadMonthlyHabitsWithStreaks,
  } = useMonthlyHabitsWithStreaks(currentMonth);

  const generateDaysInMonth = (month: string) => {
    const start = parse(month, 'yyyy-MM', new Date());
    const end = endOfMonth(start);

    const days = eachDayOfInterval({ start, end });

    return days.map((date) => ({
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'E..EEE'),
    }));
  };

  const daysInMonth = generateDaysInMonth(currentMonth);

  const navigateMonth = (direction) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1);

    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }

    const newMonth = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
    setCurrentMonth(newMonth);
  };

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      createHabit({
        name: newHabitName.trim(),
        frequency: selectedFrequency,
        month: currentMonth,
      });
      setNewHabitName('');
    }
  };
  console.log(habitsWithStreaks);

  const formatMonthYear = (month) => {
    const [year, monthNum] = month.split('-');
    const monthNames = [
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
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  useEffect(() => {
    loadMonthlyHabitsWithStreaks();
  }, [habits]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 rounded-full transition-colors"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <ChevronLeft size={16} style={{ color: 'var(--text)' }} />
          </button>

          <h1 className="text-base min-w-36 font-bold">
            <div className="flex flex-1 items-center gap-2 justify-center">
              <Calendar size={16} style={{ color: 'var(--primary)' }} />
              <span className="text-center" style={{ color: 'var(--text)' }}>
                {formatMonthYear(currentMonth)}
              </span>
            </div>
          </h1>

          <button
            onClick={() => navigateMonth('next')}
            className="p-1 rounded-full transition-colors"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <ChevronRight size={16} style={{ color: 'var(--text)' }} />
          </button>
        </div>
        <div className="flex-1 mx-2 overflow-scroll mask-fade-right pr-16 hide-scrollbar">
          <div className="flex w-fit gap-2">
            {habitsWithStreaks.map((habitStreak) => (
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
                  <span>
                    {habitStreak.currentStreak !== 0
                      ? habitStreak.currentStreak
                      : habitStreak.longestStreak}
                  </span>
                  <span className="text-xs">
                    {habitStreak.currentStreak !== 0 ? (
                      '🔥'
                    ) : habitStreak.longestStreak ===
                        habitStreak.currentStreak &&
                      habitStreak.longestStreak !== 0 ? (
                      '🔥'
                    ) : (
                      <Flame size={14} />
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Dialog>
          <DialogTrigger
            className="p-1 rounded"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            onClick={handleAddHabit}
          >
            <Plus size={18} />
          </DialogTrigger>
          <DialogContent hideClose={true} className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">
                <p style={{ color: 'var(--text)' }}>Create Your Habit</p>
              </DialogTitle>
              <DialogDescription className="pt-4 flex flex-col gap-4">
                <Input
                  type="text"
                  placeholder="Name"
                  onChange={(e) => setNewHabitName(e.target.value)}
                />
                <div className="flex gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      checked={selectedFrequency === 'daily'}
                      onChange={() => setSelectedFrequency('daily')}
                    />
                    <span>Daily</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      checked={selectedFrequency === 'weekly'}
                      onChange={() => setSelectedFrequency('weekly')}
                    />
                    <span>Weekly</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="frequency"
                      value="monthly"
                      checked={selectedFrequency === 'monthly'}
                      onChange={() => setSelectedFrequency('monthly')}
                    />
                    <span>Monthly</span>
                  </label>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={handleAddHabit}
                className="mx-auto"
                variant="default"
              >
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Habits Table */}
      <div
        className="rounded-lg shadow overflow-hidden"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead style={{ backgroundColor: 'var(--background)' }}>
              <tr>
                <th
                  className="w-20 min-w-20 px-2 py-2 text-left text-xs font-medium sticky left-0 z-10"
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--text)',
                  }}
                >
                  Habit
                </th>

                {daysInMonth.map((date) => (
                  <th
                    key={date.date}
                    className="w-5 min-w-5 px-0 py-3 text-center text-xs font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="transform -rotate-90 text-[0.65rem] whitespace-nowrap leading-none">
                        {date.dayName.slice(0, 3)}
                      </span>
                      <span className="text-[0.6rem] leading-none">
                        {date.date.split('-')[2]}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className=""
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              {habits.map((habit, index) => (
                <tr
                  key={habit.id}
                  className="hover:opacity-80"
                  style={{
                    borderBottomWidth: index !== habits.length - 1 ? '1px' : '',
                    borderColor:
                      index !== habits.length - 1 ? 'var(--border)' : '',
                  }}
                >
                  <td
                    className="w-20 min-w-20 pl-2 py-2 text-xs font-medium sticky left-0 z-10 border-r"
                    style={{
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="max-w-28 overflow-hidden">
                      <div
                        title={habit.name}
                        className="text-xs font-medium truncate leading-tight"
                      >
                        <p>{habit.name}</p>
                      </div>
                      <div className="flex items-center">
                        <div
                          className="text-[0.6rem] italic capitalize leading-tight"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {habit.frequency}
                        </div>
                        <div
                          className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs cursor-pointer"
                          style={{
                            color: 'var(--text)',
                          }}
                          onClick={() => deleteHabit(habit.id)}
                        >
                          <Trash2 size={14} />
                        </div>
                      </div>
                    </div>
                  </td>

                  {daysInMonth.map((date) => {
                    const isCompleted = getCompletionStatus(
                      habit.id,
                      date.date
                    );
                    const isToday =
                      date.date === new Date().toISOString().split('T')[0];
                    const isFuture = new Date(date.date) > new Date();

                    return (
                      <td key={date.date} className="w-5 min-w-5 px-0 py-1">
                        <div className="flex justify-center">
                          <div
                            onClick={() =>
                              !isFuture &&
                              toggleHabitCompletion(habit.id, date.date)
                            }
                            className={`w-3 h-3 rounded-none transition-all duration-200 cursor-pointer ${
                              isFuture
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isCompleted
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            } ${isToday ? 'ring-1 ring-blue-400' : ''}`}
                            title={
                              isFuture
                                ? 'Future date'
                                : isCompleted
                                ? 'Completed'
                                : 'Not completed'
                            }
                            style={{
                              backgroundColor: isFuture
                                ? 'var(--border)'
                                : isCompleted
                                ? 'var(--success)'
                                : 'var(--border)',
                            }}
                          ></div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Streaks;
