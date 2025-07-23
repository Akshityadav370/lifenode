import { dbPromise } from './db/indexedDB';

function isWithinTimeWindow(fromTime, toTime) {
  if (!fromTime || !toTime) return true;
  const now = new Date();
  const [fromH, fromM] = fromTime.split(':').map(Number);
  const [toH, toM] = toTime.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const fromMinutes = fromH * 60 + fromM;
  const toMinutes = toH * 60 + toM;
  if (fromMinutes <= toMinutes) {
    return nowMinutes >= fromMinutes && nowMinutes <= toMinutes;
  } else {
    // Overnight window (e.g., 22:00 to 06:00)
    return nowMinutes >= fromMinutes || nowMinutes <= toMinutes;
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('alarm', alarm);
  const db = await dbPromise;
  const tx = db.transaction('alarms', 'readonly');
  const index = tx.store.index('name');
  const meta = await index.get(alarm.name);

  if (!meta) return;
  if (!isWithinTimeWindow(meta.fromTime, meta.toTime)) return;

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Alarm Reminder',
    message: `Alarm: ${alarm.name} is ringing!`,
    priority: 2,
  });
});
