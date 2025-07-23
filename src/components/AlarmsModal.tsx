import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlarmService } from '../db/services/alarm-service';
import { Alarm } from '@/db/data-types';

const PRESETS = [
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1 day', value: 60 * 24 },
];

export const AlarmsModal = () => {
  const [open, setOpen] = useState(false);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [name, setName] = useState('');
  const [interval, setInterval] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('17:00');

  const fetchAlarms = async () => {
    setAlarms(await AlarmService.getAlarms());
  };

  useEffect(() => {
    if (open) fetchAlarms();
  }, [open]);

  const handleAdd = async () => {
    if (!name || (!interval && !custom)) return;
    setLoading(true);
    const now = Date.now();
    const minutes = interval || parseInt(custom);
    const meta: Alarm = {
      name,
      time: now + minutes * 60 * 1000,
      intervalMinutes: minutes,
      fromTime,
      toTime,
    };
    await AlarmService.addAlarm(meta);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Alarms</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alarms & Reminders</DialogTitle>
          <DialogDescription>
            Set alarms to get notified at your chosen intervals.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Alarm name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
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
              className="w-32"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2 items-center">
            <label>From:</label>
            <Input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              disabled={loading}
              className="w-28"
            />
            <label>To:</label>
            <Input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              disabled={loading}
              className="w-28"
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={loading || !name || (!interval && !custom)}
          >
            Add Alarm
          </Button>
        </div>
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Active Alarms</h4>
          <ul className="space-y-2">
            {alarms.length === 0 && (
              <li className="text-muted-foreground">No alarms set.</li>
            )}
            {alarms.map((a) => (
              <li
                key={a.name}
                className="flex items-center justify-between border rounded px-3 py-2"
              >
                <span>
                  <b>{a.name}</b> &mdash; {a.intervalMinutes} min interval
                  {a.fromTime && a.toTime && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({a.fromTime} - {a.toTime})
                    </span>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(a.name)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
