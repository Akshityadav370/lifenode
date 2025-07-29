import { Alarm } from '../data-types';
import { dbPromise } from '../indexedDB';

const STORE = 'alarms';

export const AlarmService = {
  async getAlarms(): Promise<Alarm[]> {
    const db = await dbPromise;
    if (!Array.from(db.objectStoreNames).includes(STORE)) return [];
    return db.getAll(STORE);
  },

  async addAlarm(meta: Alarm) {
    const db = await dbPromise;
    if (!Array.from(db.objectStoreNames).includes(STORE)) return;
    const id = await db.add(STORE, meta);

    const alarmOptions: chrome.alarms.AlarmCreateInfo = {
      when: meta.time,
      periodInMinutes: meta.intervalMinutes,
    };

    await chrome.alarms.create(meta.name, alarmOptions);

    return id;
  },

  async removeAlarm(name: string) {
    const db = await dbPromise;
    if (!Array.from(db.objectStoreNames).includes(STORE)) return;
    const all = (await db.getAll(STORE)) as Alarm[];
    const alarm = all.find((a) => a.name === name);
    if (alarm && alarm.id !== undefined) {
      await db.delete(STORE, alarm.id);
    }
    chrome.alarms.clear(name);
  },

  async clearAllAlarms() {
    const db = await dbPromise;
    if (!Array.from(db.objectStoreNames).includes(STORE)) return;
    const all = await db.getAllKeys(STORE);
    for (const id of all) {
      await db.delete(STORE, id);
    }
    chrome.alarms.clearAll();
  },
};
