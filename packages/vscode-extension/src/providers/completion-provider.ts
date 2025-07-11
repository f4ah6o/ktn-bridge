import * as vscode from 'vscode';

export class KtnBridgeCompletionProvider implements vscode.CompletionItemProvider {
  
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    
    const line = document.lineAt(position).text;
    const linePrefix = line.substr(0, position.character);
    
    // document.addEventListener の自動補完
    if (linePrefix.includes('document.addEventListener')) {
      return this.getEventCompletions();
    }
    
    // fetch API の自動補完
    if (linePrefix.includes('fetch(')) {
      return this.getApiCompletions();
    }
    
    // kintone関連の自動補完
    if (linePrefix.includes('kintone.')) {
      return this.getKintoneCompletions();
    }
    
    // 一般的なWeb標準APIの自動補完
    return this.getWebStandardCompletions();
  }
  
  private getEventCompletions(): vscode.CompletionItem[] {
    const events = [
      {
        label: 'DOMContentLoaded',
        detail: 'app.record.index.show',
        description: 'レコード一覧画面の表示完了時',
        insertText: new vscode.SnippetString(`'DOMContentLoaded', (event) => {
  const page = document.querySelector('[data-page="record-list"]');
  if (page) {
    console.log('レコード一覧が表示されました');
    \${1:// 処理を記述}
  }
}`)
      },
      {
        label: 'change',
        detail: 'app.record.edit.change',
        description: 'フィールド値変更時',
        insertText: new vscode.SnippetString(`'change', (event) => {
  const target = event.target as HTMLInputElement;
  if (target.name === '\${1:fieldName}') {
    \${2:// 処理を記述}
  }
}`)
      },
      {
        label: 'submit',
        detail: 'app.record.edit.submit',
        description: 'フォーム送信時',
        insertText: new vscode.SnippetString(`'submit', (event) => {
  const form = event.target as HTMLFormElement;
  event.preventDefault();
  \${1:// 処理を記述}
}`)
      },
      {
        label: 'beforeunload',
        detail: 'app.record.edit.change',
        description: 'ページ離脱時の確認',
        insertText: new vscode.SnippetString(`'beforeunload', (event) => {
  if (\${1:hasUnsavedChanges}) {
    event.preventDefault();
    return 'データが保存されていません。本当に離脱しますか？';
  }
}`)
      },
      {
        label: 'click',
        detail: 'custom click handler',
        description: 'カスタムクリックイベント',
        insertText: new vscode.SnippetString(`'click', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('[\${1:data-action}]')) {
    \${2:// 処理を記述}
  }
}`)
      }
    ];
    
    return events.map(event => {
      const item = new vscode.CompletionItem(event.label, vscode.CompletionItemKind.Event);
      item.detail = event.detail;
      item.documentation = new vscode.MarkdownString(event.description);
      item.insertText = event.insertText;
      return item;
    });
  }
  
  private getApiCompletions(): vscode.CompletionItem[] {
    const apis = [
      {
        label: '/api/records',
        detail: 'kintone.api(/k/v1/records)',
        description: 'レコード一覧を取得',
        insertText: new vscode.SnippetString(`'/api/records?app=\${1:appId}&\${2:query}'`)
      },
      {
        label: '/api/record',
        detail: 'kintone.api(/k/v1/record)',
        description: 'レコード詳細を取得',
        insertText: new vscode.SnippetString(`'/api/record?app=\${1:appId}&id=\${2:recordId}'`)
      },
      {
        label: '/api/record/create',
        detail: 'kintone.api(/k/v1/record)',
        description: 'レコードを作成',
        insertText: new vscode.SnippetString(`'/api/record', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app: \${1:appId},
    record: \${2:recordData}
  })
}`)
      },
      {
        label: '/api/record/update',
        detail: 'kintone.api(/k/v1/record)',
        description: 'レコードを更新',
        insertText: new vscode.SnippetString(`'/api/record', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app: \${1:appId},
    id: \${2:recordId},
    record: \${3:recordData}
  })
}`)
      }
    ];
    
    return apis.map(api => {
      const item = new vscode.CompletionItem(api.label, vscode.CompletionItemKind.Method);
      item.detail = api.detail;
      item.documentation = new vscode.MarkdownString(api.description);
      item.insertText = api.insertText;
      return item;
    });
  }
  
  private getKintoneCompletions(): vscode.CompletionItem[] {
    const kintoneApis = [
      {
        label: 'events.on',
        detail: 'kintone.events.on(event, handler)',
        description: 'kintoneイベントにハンドラーを登録',
        insertText: new vscode.SnippetString(`events.on('\${1:eventType}', (event) => {
  \${2:// 処理を記述}
  return event;
})`)
      },
      {
        label: 'api',
        detail: 'kintone.api(pathOrUrl, method, params)',
        description: 'kintone APIを呼び出し',
        insertText: new vscode.SnippetString(`api('\${1:/k/v1/records}', '\${2:GET}', \${3:params})`)
      },
      {
        label: 'app.getId',
        detail: 'kintone.app.getId()',
        description: 'アプリIDを取得',
        insertText: 'app.getId()'
      },
      {
        label: 'app.record.getId',
        detail: 'kintone.app.record.getId()',
        description: 'レコードIDを取得',
        insertText: 'app.record.getId()'
      }
    ];
    
    return kintoneApis.map(api => {
      const item = new vscode.CompletionItem(api.label, vscode.CompletionItemKind.Method);
      item.detail = api.detail;
      item.documentation = new vscode.MarkdownString(api.description);
      item.insertText = api.insertText;
      return item;
    });
  }
  
  private getWebStandardCompletions(): vscode.CompletionItem[] {
    const webApis = [
      {
        label: 'document.querySelector',
        detail: 'Web標準 DOM API',
        description: 'セレクターに一致する最初の要素を取得',
        insertText: new vscode.SnippetString(`document.querySelector('\${1:selector}')`)
      },
      {
        label: 'document.querySelectorAll',
        detail: 'Web標準 DOM API',
        description: 'セレクターに一致するすべての要素を取得',
        insertText: new vscode.SnippetString(`document.querySelectorAll('\${1:selector}')`)
      },
      {
        label: 'fetch',
        detail: 'Web標準 Fetch API',
        description: 'HTTPリクエストを実行',
        insertText: new vscode.SnippetString(`fetch('\${1:url}', {
  method: '\${2:GET}',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(\${3:data})
})`)
      },
      {
        label: 'CustomEvent',
        detail: 'Web標準 Event API',
        description: 'カスタムイベントを作成',
        insertText: new vscode.SnippetString(`new CustomEvent('\${1:eventType}', {
  detail: \${2:eventData}
})`)
      }
    ];
    
    return webApis.map(api => {
      const item = new vscode.CompletionItem(api.label, vscode.CompletionItemKind.Method);
      item.detail = api.detail;
      item.documentation = new vscode.MarkdownString(api.description);
      item.insertText = api.insertText;
      return item;
    });
  }
}