import * as vscode from 'vscode';

export class KtnBridgeHoverProvider implements vscode.HoverProvider {
  
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    
    const range = document.getWordRangeAtPosition(position);
    if (!range) {
      return null;
    }
    
    const word = document.getText(range);
    const line = document.lineAt(position).text;
    
    // イベントマッピングの説明
    if (line.includes('addEventListener')) {
      return this.getEventHover(word, range);
    }
    
    // API マッピングの説明
    if (line.includes('fetch(')) {
      return this.getApiHover(word, range);
    }
    
    // kintone API の説明
    if (line.includes('kintone.')) {
      return this.getKintoneHover(word, range);
    }
    
    return null;
  }
  
  private getEventHover(word: string, range: vscode.Range): vscode.Hover | null {
    const eventMappings: { [key: string]: any } = {
      'DOMContentLoaded': {
        kintoneEvent: 'app.record.index.show',
        description: 'レコード一覧画面の表示完了時に発生',
        example: `
// Web標準の書き方
document.addEventListener('DOMContentLoaded', (event) => {
  const page = document.querySelector('[data-page="record-list"]');
  if (page) {
    console.log('レコード一覧が表示されました');
  }
});

// 変換されるkintoneコード
kintone.events.on('app.record.index.show', (event) => {
  console.log('レコード一覧が表示されました');
  return event;
});`
      },
      'change': {
        kintoneEvent: 'app.record.edit.change',
        description: 'フィールド値変更時に発生',
        example: `
// Web標準の書き方
document.addEventListener('change', (event) => {
  const target = event.target as HTMLInputElement;
  if (target.name === 'title') {
    console.log('タイトルが変更されました');
  }
});

// 変換されるkintoneコード
kintone.events.on('app.record.edit.change.title', (event) => {
  console.log('タイトルが変更されました');
  return event;
});`
      },
      'submit': {
        kintoneEvent: 'app.record.edit.submit',
        description: 'フォーム送信時に発生',
        example: `
// Web標準の書き方
document.addEventListener('submit', (event) => {
  const form = event.target as HTMLFormElement;
  event.preventDefault();
  // カスタム送信処理
});

// 変換されるkintoneコード
kintone.events.on('app.record.edit.submit', (event) => {
  // カスタム送信処理
  return event;
});`
      },
      'beforeunload': {
        kintoneEvent: 'app.record.edit.change',
        description: 'ページ離脱時の確認処理',
        example: `
// Web標準の書き方
document.addEventListener('beforeunload', (event) => {
  if (hasUnsavedChanges) {
    event.preventDefault();
    return 'データが保存されていません。本当に離脱しますか？';
  }
});

// 変換されるkintoneコード
kintone.events.on('app.record.edit.change', (event) => {
  // 未保存チェック処理
  return event;
});`
      }
    };
    
    const mapping = eventMappings[word];
    if (!mapping) {
      return null;
    }
    
    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`**${word}** → **${mapping.kintoneEvent}**\n\n`);
    markdown.appendMarkdown(`${mapping.description}\n\n`);
    markdown.appendCodeblock(mapping.example, 'typescript');
    
    return new vscode.Hover(markdown, range);
  }
  
  private getApiHover(word: string, range: vscode.Range): vscode.Hover | null {
    const apiMappings: { [key: string]: any } = {
      'fetch': {
        kintoneApi: 'kintone.api',
        description: 'Web標準のFetch APIをkintone APIに変換',
        example: `
// Web標準の書き方
const response = await fetch('/api/records?app=1');
const data = await response.json();

// 変換されるkintoneコード
const response = await kintone.api('/k/v1/records', 'GET', {app: 1});`
      },
      'records': {
        kintoneApi: '/k/v1/records',
        description: 'レコード一覧を取得するAPI',
        example: `
// Web標準の書き方
const response = await fetch('/api/records?app=1&query=status="進行中"');
const data = await response.json();

// 変換されるkintoneコード
const response = await kintone.api('/k/v1/records', 'GET', {
  app: 1,
  query: 'status="進行中"'
});`
      },
      'record': {
        kintoneApi: '/k/v1/record',
        description: 'レコード詳細を取得・更新するAPI',
        example: `
// Web標準の書き方（取得）
const response = await fetch('/api/record?app=1&id=100');
const data = await response.json();

// Web標準の書き方（更新）
const response = await fetch('/api/record', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app: 1,
    id: 100,
    record: { title: { value: '新しいタイトル' } }
  })
});

// 変換されるkintoneコード
const response = await kintone.api('/k/v1/record', 'PUT', {
  app: 1,
  id: 100,
  record: { title: { value: '新しいタイトル' } }
});`
      }
    };
    
    const mapping = apiMappings[word];
    if (!mapping) {
      return null;
    }
    
    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`**${word}** → **${mapping.kintoneApi}**\n\n`);
    markdown.appendMarkdown(`${mapping.description}\n\n`);
    markdown.appendCodeblock(mapping.example, 'typescript');
    
    return new vscode.Hover(markdown, range);
  }
  
  private getKintoneHover(word: string, range: vscode.Range): vscode.Hover | null {
    const kintoneApis: { [key: string]: any } = {
      'events': {
        description: 'kintoneイベントシステム',
        example: `
// イベントハンドラーの登録
kintone.events.on('app.record.index.show', (event) => {
  console.log('レコード一覧が表示されました');
  return event;
});

// 複数イベントの登録
kintone.events.on([
  'app.record.create.show',
  'app.record.edit.show'
], (event) => {
  console.log('レコード詳細が表示されました');
  return event;
});`
      },
      'api': {
        description: 'kintone REST API呼び出し',
        example: `
// レコード一覧を取得
const records = await kintone.api('/k/v1/records', 'GET', {
  app: 1,
  query: 'status="進行中"'
});

// レコードを作成
const result = await kintone.api('/k/v1/record', 'POST', {
  app: 1,
  record: {
    title: { value: '新しいレコード' }
  }
});`
      },
      'app': {
        description: 'アプリケーション情報とユーティリティ',
        example: `
// アプリIDを取得
const appId = kintone.app.getId();

// レコードIDを取得（詳細・編集画面）
const recordId = kintone.app.record.getId();

// ヘッダーメニューエリアを取得
const menuSpace = kintone.app.getHeaderMenuSpaceElement();

// レコード詳細エリアを取得
const detailSpace = kintone.app.record.getSpaceElement('detail_space');`
      }
    };
    
    const api = kintoneApis[word];
    if (!api) {
      return null;
    }
    
    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`**kintone.${word}**\n\n`);
    markdown.appendMarkdown(`${api.description}\n\n`);
    markdown.appendCodeblock(api.example, 'typescript');
    
    return new vscode.Hover(markdown, range);
  }
}