import { useMonthlyHabits } from '@/hooks/useHabits';
import { eachDayOfInterval, endOfMonth, format, parse } from 'date-fns';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
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

  console.log('habits', habits);

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
  console.log('daysInMonth', daysInMonth);

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
      });
      setNewHabitName('');
      setSelectedFrequency(undefined);
    }
  };

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

          <h1 className="text-base font-bold flex items-center gap-2">
            <Calendar size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--text)' }}>
              {formatMonthYear(currentMonth)}
            </span>
          </h1>

          <button
            onClick={() => navigateMonth('next')}
            className="p-1 rounded-full transition-colors"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <ChevronRight size={16} style={{ color: 'var(--text)' }} />
          </button>
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
                Create Your Habit
              </DialogTitle>
              <DialogDescription className="pt-4 flex flex-col gap-4">
                <Input
                  type="text"
                  placeholder="Name"
                  onChange={(e) => setNewHabitName(e.target.value)}
                />
                <Select
                  onValueChange={(value: HabitFrequency) =>
                    setSelectedFrequency(value)
                  }
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
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
                      <span className="transform -rotate-90 text-[0.6rem] whitespace-nowrap leading-none">
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
              className="divide-y"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              {habits.map((habit) => (
                <tr key={habit.id} className="hover:opacity-80">
                  <td
                    className="w-20 min-w-20 pl-2 py-2 text-xs font-medium sticky left-0 z-10 border-r"
                    style={{
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="text-xs max-w-28 font-medium truncate leading-tight">
                        <p>{habit.name}</p>
                      </div>
                      <div
                        className="text-[0.6rem] italic capitalize leading-tight"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {habit.frequency}
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
                          >
                            {/* {isCompleted ? '✓' : 'x'} */}
                          </div>
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
