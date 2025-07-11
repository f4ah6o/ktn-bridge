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
  },
  
  // フィールド変更イベント
  'app.record.edit.change': {
    kintoneEvent: 'app.record.edit.change',
    web: {
      event: 'change',
      selector: 'input, select, textarea',
      description: 'レコード編集時のフィールド値変更'
    },
    transform: {
      in: (webEvent: Event): KintoneEvent => {
        const target = webEvent.target as HTMLInputElement;
        return {
          type: 'app.record.edit.change',
          record: {},
          changes: {
            field: {
              type: target.type,
              value: target.value
            }
          },
          fieldName: target.name
        };
      },
      out: (kintoneEvent: KintoneEvent): CustomEvent => 
        new CustomEvent('fieldchange', {
          detail: { 
            record: kintoneEvent.record,
            changes: kintoneEvent.changes,
            fieldName: kintoneEvent.fieldName
          }
        })
    },
    example: {
      web: `
// Web標準の書き方
document.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement;
  if (target.name === 'title') {
    console.log('タイトルが変更されました:', target.value);
  }
});`,
      kintone: `
// kintoneの書き方
kintone.events.on('app.record.edit.change.title', (event) => {
  console.log('タイトルが変更されました:', event.changes.field.value);
  return event;
});`
    },
    since: '2019.02'
  },
  
  // ページ離脱前のイベント
  'app.record.edit.beforeunload': {
    kintoneEvent: 'app.record.edit.beforeunload',
    web: {
      event: 'beforeunload',
      selector: 'window',
      description: 'レコード編集中のページ離脱前'
    },
    transform: {
      in: (_webEvent: Event): KintoneEvent => ({
        type: 'app.record.edit.beforeunload',
        record: {},
        hasUnsavedChanges: true
      }),
      out: (kintoneEvent: KintoneEvent): CustomEvent => 
        new CustomEvent('beforeunload', {
          detail: { 
            record: kintoneEvent.record,
            hasUnsavedChanges: kintoneEvent.hasUnsavedChanges
          }
        })
    },
    example: {
      web: `
// Web標準の書き方
document.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges()) {
    e.preventDefault();
    e.returnValue = 'データが保存されていません';
  }
});`,
      kintone: `
// kintoneの書き方
kintone.events.on('app.record.edit.beforeunload', (event) => {
  if (event.hasUnsavedChanges) {
    event.cancel = true;
    event.message = 'データが保存されていません';
  }
  return event;
});`
    },
    since: '2019.02'
  },
  
  // カスタムイベント
  'app.record.custom.bulkEdit': {
    kintoneEvent: 'app.record.custom.bulkEdit',
    web: {
      event: 'bulkEditStart',
      selector: 'document',
      description: '一括編集開始時のカスタムイベント'
    },
    transform: {
      in: (webEvent: Event): KintoneEvent => ({
        type: 'app.record.custom.bulkEdit',
        selectedRecords: (webEvent as CustomEvent).detail?.selectedRecords || [],
        timestamp: (webEvent as CustomEvent).detail?.timestamp
      }),
      out: (kintoneEvent: KintoneEvent): CustomEvent => 
        new CustomEvent('bulkEditStart', {
          detail: { 
            selectedRecords: kintoneEvent.selectedRecords,
            timestamp: kintoneEvent.timestamp
          }
        })
    },
    example: {
      web: `
// Web標準の書き方
document.addEventListener('bulkEditStart', (e) => {
  const selectedRecords = e.detail.selectedRecords;
  console.log('一括編集を開始します:', selectedRecords);
});`,
      kintone: `
// kintoneの書き方
kintone.events.on('app.record.custom.bulkEdit', (event) => {
  const selectedRecords = event.selectedRecords;
  console.log('一括編集を開始します:', selectedRecords);
  return event;
});`
    },
    since: '2024.12'
  },
  
  // クリックイベント（汎用）
  'app.record.index.click': {
    kintoneEvent: 'app.record.index.click',
    web: {
      event: 'click',
      selector: '[data-action]',
      description: 'レコード一覧でのアクション実行'
    },
    transform: {
      in: (webEvent: Event): KintoneEvent => {
        const target = webEvent.target as HTMLElement;
        return {
          type: 'app.record.index.click',
          action: target.dataset.action || '',
          element: target
        };
      },
      out: (kintoneEvent: KintoneEvent): CustomEvent => 
        new CustomEvent('actionclick', {
          detail: { 
            action: kintoneEvent.action,
            element: kintoneEvent.element
          }
        })
    },
    example: {
      web: `
// Web標準の書き方
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.matches('[data-action="bulk-edit"]')) {
    console.log('一括編集ボタンがクリックされました');
  }
});`,
      kintone: `
// kintoneの書き方
kintone.events.on('app.record.index.click', (event) => {
  if (event.action === 'bulk-edit') {
    console.log('一括編集ボタンがクリックされました');
  }
  return event;
});`
    },
    since: '2024.12'
  }
};

export function getEventMapping(eventName: string): EventMapping | undefined {
  return eventMappings[eventName];
}

export function getAllEventMappings(): Record<string, EventMapping> {
  return eventMappings;
}