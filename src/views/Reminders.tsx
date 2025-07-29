import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alarm } from '@/db/data-types';
import { AlarmService } from '@/db/services/alarm-service';
import { Trash2, Clock, MessageSquare, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

const PRESETS = [
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h', value: 60 },
  { label: '1d', value: 60 * 24 },
];

const Reminders = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [name, setName] = useState('');
  const [interval, setInterval] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('17:00');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [enableTimeWindow, setTimeWindow] = useState(false);
  const [error, setError] = useState('');

  const fetchAlarms = async () => {
    const fetchedAlarms = await AlarmService.getAlarms();
    console.log('fetchedAlarms', JSON.stringify(fetchedAlarms));
    setAlarms(fetchedAlarms);
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (
      alarms.some((alarm) => alarm.name.toLowerCase() === name.toLowerCase())
    ) {
      return 'Name already exists';
    }
    return null;
  };

  const handleAdd = async () => {
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    if (!interval && !custom) {
      setError('Please select or enter an interval');
      return;
    }

    setError('');
    setLoading(true);

    const now = Date.now();
    const minutes = interval || parseInt(custom);
    const meta: Alarm = {
      name: name.trim(),
      time: now + minutes * 60 * 1000,
      intervalMinutes: minutes,
      fromTime: enableTimeWindow ? fromTime : undefined,
      toTime: enableTimeWindow ? toTime : undefined,
      title: title.trim() || undefined,
      message: message.trim() || undefined,
    };

    console.log('meta', meta, custom);
    await AlarmService.addAlarm(meta);

    // Reset form
    setName('');
    setInterval(null);
    setCustom('');
    setFromTime('09:00');
    setToTime('17:00');
    setTitle('');
    setMessage('');
    setTimeWindow(false);
    setLoading(false);
    fetchAlarms();
  };

  const handleDelete = async (name: string) => {
    await AlarmService.removeAlarm(name);
    fetchAlarms();
  };

  const clearError = () => {
    if (error) setError('');
  };

  return (
    <div className="w-full min-w-[600px]">
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Label
              className="text-xs font-medium mb-1 block ml-1"
              style={{ color: 'var(--text)' }}
            >
              Name *
            </Label>
            <Input
              placeholder="Water break"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError();
              }}
              disabled={loading}
              className="text-sm h-8"
              style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
              }}
            />
          </div>
          <div className="flex-1">
            <Label
              className="text-xs font-medium mb-1 block ml-1"
              style={{ color: 'var(--text)' }}
            >
              Title
            </Label>
            <Input
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="text-sm h-8"
              style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
              }}
            />
          </div>
          <div className="flex-1">
            <Label
              className="text-xs font-medium mb-1 block ml-1"
              style={{ color: 'var(--text)' }}
            >
              Message
            </Label>
            <Input
              placeholder="Description"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              className="text-sm h-8"
              style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
              }}
            />
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label
              className="text-xs font-medium mb-1 block ml-1"
              style={{ color: 'var(--text)' }}
            >
              Interval *
            </Label>
            <div className="flex gap-1">
              {PRESETS.map((p) => (
                <Button
                  key={p.value}
                  variant={interval === p.value ? 'default' : 'outline'}
                  onClick={() => {
                    setInterval(p.value);
                    setCustom('');
                    clearError();
                  }}
                  disabled={loading}
                  className="text-xs h-8 px-3 flex-1"
                  style={{
                    color:
                      interval === p.value ? 'var(--surface)' : 'var(--text)',
                    backgroundColor:
                      interval === p.value
                        ? 'var(--accent)'
                        : 'var(--secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="w-24">
            <Label
              className="text-xs font-medium mb-1 block ml-1"
              style={{ color: 'var(--text)' }}
            >
              Custom
            </Label>
            <Input
              type="number"
              min={1}
              placeholder="min"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setInterval(null);
                clearError();
              }}
              style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
              }}
              className="text-sm h-8"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enableTimeWindow}
              onChange={(e) => setTimeWindow(e.target.checked)}
              className="w-3 h-3"
              disabled={loading}
            />
            <Label
              className="text-xs font-medium whitespace-nowrap"
              style={{ color: 'var(--text)' }}
            >
              Time Window
            </Label>
          </div>
          {enableTimeWindow ? (
            <>
              <div className="w-20 flex gap-1 items-end mr-10">
                <Label
                  className="text-xs mb-1 block"
                  style={{ color: 'var(--textMuted)' }}
                >
                  From
                </Label>
                <Input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  disabled={loading}
                  className="text-sm h-8"
                  style={{
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                  }}
                />
              </div>
              <div className="w-20 flex gap-1 items-end">
                <Label
                  className="text-xs mb-1 block"
                  style={{ color: 'var(--textMuted)' }}
                >
                  To
                </Label>
                <Input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  disabled={loading}
                  className="text-sm h-8"
                  style={{
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                  }}
                />
              </div>
              <div className="flex-1">
                {/* Error Message */}
                {error && (
                  <div
                    className="text-xs p-2 mx-5 rounded border-l-2"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderLeftColor: 'var(--error)',
                      color: 'var(--error)',
                    }}
                  >
                    {error}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1">
              {/* Error Message */}
              {error && (
                <div
                  className="text-xs p-2 rounded border-l-2"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderLeftColor: 'var(--error)',
                    color: 'var(--error)',
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleAdd}
            disabled={loading || !name.trim() || (!interval && !custom)}
            className="h-8 px-4 flex items-center gap-2"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--surface)',
              opacity:
                loading || !name.trim() || (!interval && !custom) ? 0.5 : 1,
            }}
          >
            <Plus size={14} />
            {loading ? 'Adding...' : 'Add Reminder'}
          </Button>
        </div>

        <div
          className="text-center pt-2 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <span
            className="text-xs opacity-60"
            style={{ color: 'var(--textMuted)' }}
          >
            💡 Enable Chrome notifications to receive reminders
          </span>
        </div>
      </div>

      <div className="">
        <h4
          className="font-semibold text-sm mb-2 flex items-center gap-2"
          style={{ color: 'var(--text)' }}
        >
          <MessageSquare size={14} />
          Active Alarms ({alarms.length})
        </h4>

        {alarms.length === 0 ? (
          <div
            className="text-xs text-center py-6 border rounded opacity-60"
            style={{ color: 'var(--textMuted)', borderColor: 'var(--border)' }}
          >
            No active alarms
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {alarms.map((a) => (
              <div
                key={a.name}
                className="flex items-center justify-between p-2 rounded border text-xs"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <div className="font-medium truncate">{a.name}</div>

                  {(a.title || a.message) && (
                    <div className="opacity-60 text-xs truncate">
                      {a.title && <p>"{a.title}"</p>}
                      {a.message && <p>{a.message}</p>}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDelete(a.name)}
                    className="bg-transparent outline-none focus:outline-none h-6 w-6 p-0 flex-shrink-0"
                    style={{ color: 'var(--error)' }}
                  >
                    <Trash2 size={4} />
                  </Button>
                  <div className="opacity-70 text-xs flex items-center gap-1">
                    <span>{a.intervalMinutes}m</span>
                    {a.fromTime && a.toTime && (
                      <span>
                        • {a.fromTime}-{a.toTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reminders;
