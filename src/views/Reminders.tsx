import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alarm } from '@/db/data-types';
import { AlarmService } from '@/db/services/alarm-service';
import { Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const PRESETS = [
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1 day', value: 60 * 24 },
];

const Reminders = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [name, setName] = useState('');
  const [interval, setInterval] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('17:00');
  const [enableTimeWindow, setTimeWindow] = useState(false);

  const fetchAlarms = async () => {
    const fetchedAlarms = await AlarmService.getAlarms();
    console.log('fetchedAlarms', JSON.stringify(fetchAlarms));
    setAlarms(fetchedAlarms);
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  const handleAdd = async () => {
    if (!name || (!interval && !custom)) return;
    setLoading(true);
    const now = Date.now();
    const minutes = interval || parseInt(custom);
    const meta: Alarm = {
      name,
      time: now + minutes * 60 * 1000,
      intervalMinutes: minutes,
      fromTime: enableTimeWindow && fromTime,
      toTime: enableTimeWindow && toTime,
    };
    await AlarmService.addAlarm(meta);
    fetchAlarms();
    setName('');
    setInterval(null);
    setCustom('');
    setFromTime('09:00');
    setToTime('17:00');
    setLoading(false);
    fetchAlarms();
  };

  const handleDelete = async (name: string) => {
    await AlarmService.removeAlarm(name);
    fetchAlarms();
  };

  return (
    <div className="w-full mx-auto">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Alarm name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}
          />
          <div className="flex gap-2 items-center">
            {enableTimeWindow ? (
              <>
                <label>From:</label>
                <Input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  disabled={loading}
                  className="w-28"
                  style={{
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                  }}
                />
                <label>To:</label>
                <Input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  disabled={loading}
                  className="w-28"
                  style={{
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                  }}
                />
                <X onClick={() => setTimeWindow(false)} />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  className="aspect-square size-5"
                  type="checkbox"
                  value={enableTimeWindow ? 1 : 0}
                  onChange={(e) => setTimeWindow(!enableTimeWindow)}
                />
                <Label className="w-36 flex flex-nowrap">
                  Enable Time Window
                </Label>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <Button
              key={p.value}
              variant={interval === p.value ? 'default' : 'outline'}
              onClick={() => {
                setInterval(p.value);
                setCustom('');
              }}
              disabled={loading}
              style={{
                color: 'var(--surface)',
                backgroundColor:
                  interval === p.value ? 'var(--accent)' : 'var(--secondary)',
              }}
            >
              {p.label}
            </Button>
          ))}
          <Input
            type="number"
            min={1}
            placeholder="Custom (min)"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setInterval(null);
            }}
            style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}
            className="w-32"
            disabled={loading}
          />
          <Button
            onClick={handleAdd}
            className="my-button flex-1"
            disabled={loading || !name || (!interval && !custom)}
            style={{ backgroundColor: 'var(--border)', color: 'var(--text)' }}
          >
            Add Reminder
          </Button>
        </div>
        <div className="text-center">
          <span style={{ color: 'var(--text)' }} className="opacity-40">
            NOTE {':'} Enable Google Chrome notifications to receive the
            reminder!
          </span>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Active Alarms</h4>
        <ul className="flex flex-col flex-wrap max-h-52 overflow-scroll gap-4 hide-scrollbar">
          {alarms.length === 0 && (
            <li className="text-muted-foreground">No alarms set.</li>
          )}
          {alarms.map((a) => (
            <li
              key={a.name}
              className="flex items-stretch border rounded px-3 py-2 w-fit gap-4"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              <span>
                <b>{a.name}</b> &mdash; {a.intervalMinutes} min interval
                {a.fromTime && a.toTime && (
                  <span
                    className="ml-2 text-xs text-muted-foreground"
                    style={{
                      color: 'var(--textMuted)',
                    }}
                  >
                    ({a.fromTime} - {a.toTime})
                  </span>
                )}
              </span>
              <Trash2
                size={16}
                onClick={() => handleDelete(a.name)}
                style={{ color: 'var(--error)' }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Reminders;
