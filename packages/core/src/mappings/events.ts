import type { EventMapping, KintoneEvent } from '../types';

export const eventMappings: Record<string, EventMapping> = {
  'app.record.index.show': {
    kintoneEvent: 'app.record.index.show',
    web: {
      event: 'DOMContentLoaded',
      selector: '[data-page="record-list"]',
      description: 'レコード一覧画面の表示完了時'
    },
    transform: {
      in: (webEvent: Event): KintoneEvent => ({
        type: 'app.record.index.show',
        records: (webEvent as CustomEvent).detail?.records || [],
        appId: (webEvent as CustomEvent).detail?.appId
      }),
      out: (kintoneEvent: KintoneEvent): CustomEvent => 
        new CustomEvent('pageload', {
          detail: { 
            records: kintoneEvent.records,
            appId: kintoneEvent.appId 
          }
        })
    },
    example: {
      web: `
// Web標準の書き方
document.addEventListener('DOMContentLoaded', (e) => {
  if (e.target.matches('[data-page="record-list"]')) {
    const records = e.detail.records;
    console.log('レコード一覧画面が表示されました');
  }
});`,
      kintone: `
// kintoneの書き方
kintone.events.on('app.record.index.show', (event) => {
  const records = event.records;
  console.log('レコード一覧画面が表示されました');
  return event;
});`
    },
    since: '2019.02'
  }
};

export function getEventMapping(eventName: string): EventMapping | undefined {
  return eventMappings[eventName];
}

export function getAllEventMappings(): Record<string, EventMapping> {
  return eventMappings;
}