import { dbPromise } from './db/indexedDB';
import { ChatService } from './db/services/chat-service';

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
    title: meta.title ? meta.title : 'Alarm Reminder',
    message: meta.message ? meta.message : `Alarm: ${alarm.name} is ringing!`,
    priority: 2,
  });
});

// Chat service message proxy so all contexts share extension-origin IndexedDB
chrome.runtime.onMessage.addListener(
  (
    request: {
      type: 'chat:save' | 'chat:fetch' | 'chat:clear' | 'chat:list';
      payload?: any;
    },
    _sender,
    sendResponse
  ) => {
    (async () => {
      try {
        switch (request.type) {
          case 'chat:save': {
            const { problemName, history } = request.payload || {};
            await ChatService.saveChatHistory(problemName, history);
            sendResponse({ ok: true });
            break;
          }
          case 'chat:fetch': {
            const { problemName, limit, offset } = request.payload || {};
            const data = await ChatService.fetchChatHistory(
              problemName,
              limit,
              offset
            );
            sendResponse({ ok: true, data });
            break;
          }
          case 'chat:clear': {
            const { problemName } = request.payload || {};
            await ChatService.clearChatHistory(problemName);
            sendResponse({ ok: true });
            break;
          }
          case 'chat:list': {
            const list = await ChatService.fetchAllChats();
            sendResponse({ ok: true, data: list });
            break;
          }
          default: {
            sendResponse({ ok: false, error: 'unknown_type' });
          }
        }
      } catch (error: any) {
        sendResponse({ ok: false, error: error?.message || 'unknown_error' });
      }
    })();

    return true;
  }
);
