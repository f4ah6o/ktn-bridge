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
  },
  
  'app.record.detail.show': {
    kintoneEvent: 'app.record.detail.show',
    web: {
      event: 'DOMContentLoaded',
      selector: '[data-page="record-detail"]',
      description: 'レコード詳細画面の表示完了時'
    },
    transform: {
      in: (webEvent: Event): KintoneEvent => ({
        type: 'app.record.detail.show',
        record: (webEvent as CustomEvent).detail?.record || {},
        recordId: (webEvent as CustomEvent).detail?.recordId,
        appId: (webEvent as CustomEvent).detail?.appId
      }),
      out: (kintoneEvent: KintoneEvent): CustomEvent => 
        new CustomEvent('pageload', {
          detail: { 
            record: kintoneEvent.record,
            recordId: kintoneEvent.recordId,
            appId: kintoneEvent.appId 
          }
        })
    },
    example: {
      web: `
// Web標準の書き方
document.addEventListener('DOMContentLoaded', (e) => {
  if (e.target.matches('[data-page="record-detail"]')) {
    const record = e.detail.record;
    console.log('レコード詳細画面が表示されました');
  }
});`,
      kintone: `
// kintoneの書き方
kintone.events.on('app.record.detail.show', (event) => {
  const record = event.record;
  console.log('レコード詳細画面が表示されました');
  return event;
});`
    },
    since: '2019.02'
  },
  
  'app.record.create.show': {
    kintoneEvent: 'app.record.create.show',
    web: {
      event: 'DOMContentLoaded',
      selector: '[data-page="record-create"]',
      description: 'レコード新規作成画面の表示完了時'
    },
    transform: {
      in: (webEvent: Event): KintoneEvent => ({
        type: 'app.record.create.show',
        record: (webEvent as CustomEvent).detail?.record || {},
        appId: (webEvent as CustomEvent).detail?.appId
      }),
      out: (kintoneEvent: KintoneEvent): CustomEvent => 
        new CustomEvent('pageload', {
          detail: { 
            record: kintoneEvent.record,
            appId: kintoneEvent.appId 
          }
        })
    },
    example: {
      web: `
// Web標準の書き方
document.addEventListener('DOMContentLoaded', (e) => {
  if (e.target.matches('[data-page="record-create"]')) {
    const record = e.detail.record;
    console.log('レコード新規作成画面が表示されました');
  }
});`,
      kintone: `
// kintoneの書き方
kintone.events.on('app.record.create.show', (event) => {
  const record = event.record;
  console.log('レコード新規作成画面が表示されました');
  return event;
});`
    },
    since: '2019.02'
  },
  
  'app.record.edit.show': {
    kintoneEvent: 'app.record.edit.show',
    web: {
      event: 'DOMContentLoaded',
      selector: '[data-page="record-edit"]',
      description: 'レコード編集画面の表示完了時'
    },
    transform: {
      in: (webEvent: Event): KintoneEvent => ({
        type: 'app.record.edit.show',
        record: (webEvent as CustomEvent).detail?.record || {},
        recordId: (webEvent as CustomEvent).detail?.recordId,
        appId: (webEvent as CustomEvent).detail?.appId
      }),
      out: (kintoneEvent: KintoneEvent): CustomEvent => 
        new CustomEvent('pageload', {
          detail: { 
            record: kintoneEvent.record,
            recordId: kintoneEvent.recordId,
            appId: kintoneEvent.appId 
          }
        })
    },
    example: {
      web: `
// Web標準の書き方
document.addEventListener('DOMContentLoaded', (e) => {
  if (e.target.matches('[data-page="record-edit"]')) {
    const record = e.detail.record;
    console.log('レコード編集画面が表示されました');
  }
});`,
      kintone: `
// kintoneの書き方
kintone.events.on('app.record.edit.show', (event) => {
  const record = event.record;
  console.log('レコード編集画面が表示されました');
  return event;
});`
    },
    since: '2019.02'
  },
  
  'app.record.create.submit': {
    kintoneEvent: 'app.record.create.submit',
    web: {
      event: 'submit',
      selector: '[data-form="record-create"]',
      description: 'レコード新規作成時の送信処理'
    },
    transform: {
      in: (webEvent: Event): KintoneEvent => ({
        type: 'app.record.create.submit',
        record: (webEvent as CustomEvent).detail?.record || {},
        appId: (webEvent as CustomEvent).detail?.appId
      }),
      out: (kintoneEvent: KintoneEvent): CustomEvent => 
        new CustomEvent('formsubmit', {
          detail: { 
            record: kintoneEvent.record,
            appId: kintoneEvent.appId 
          }
        })
    },
    example: {
      web: `
// Web標準の書き方
document.addEventListener('submit', (e) => {
  if (e.target.matches('[data-form="record-create"]')) {
    const record = e.detail.record;
    console.log('レコードを新規作成します');
  }
});`,
      kintone: `
// kintoneの書き方
kintone.events.on('app.record.create.submit', (event) => {
  const record = event.record;
  console.log('レコードを新規作成します');
  return event;
});`
    },
    since: '2019.02'
  },
  
  'app.record.edit.submit': {
    kintoneEvent: 'app.record.edit.submit',
    web: {
      event: 'submit',
      selector: '[data-form="record-edit"]',
      description: 'レコード編集時の送信処理'
    },
    transform: {
      in: (webEvent: Event): KintoneEvent => ({
        type: 'app.record.edit.submit',
        record: (webEvent as CustomEvent).detail?.record || {},
        recordId: (webEvent as CustomEvent).detail?.recordId,
        appId: (webEvent as CustomEvent).detail?.appId
      }),
      out: (kintoneEvent: KintoneEvent): CustomEvent => 
        new CustomEvent('formsubmit', {
          detail: { 
            record: kintoneEvent.record,
            recordId: kintoneEvent.recordId,
            appId: kintoneEvent.appId 
          }
        })
    },
    example: {
      web: `
// Web標準の書き方
document.addEventListener('submit', (e) => {
  if (e.target.matches('[data-form="record-edit"]')) {
    const record = e.detail.record;
    console.log('レコードを更新します');
  }
});`,
      kintone: `
// kintoneの書き方
kintone.events.on('app.record.edit.submit', (event) => {
  const record = event.record;
  console.log('レコードを更新します');
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