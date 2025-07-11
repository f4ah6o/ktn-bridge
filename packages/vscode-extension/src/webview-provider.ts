import * as vscode from 'vscode';

export class KtnBridgeWebviewProvider {
  private context: vscode.ExtensionContext;
  
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }
  
  /**
   * コード変換プレビュー用のWebビューを作成
   */
  createPreviewWebview(originalCode: string, transformedCode: string): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
      'ktnBridgePreview',
      'ktn-bridge Preview',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );
    
    panel.webview.html = this.getPreviewHtml(originalCode, transformedCode);
    
    return panel;
  }
  
  /**
   * パターンライブラリ用のWebビューを作成
   */
  createPatternsWebview(): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
      'ktnBridgePatterns',
      'ktn-bridge Pattern Library',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );
    
    panel.webview.html = this.getPatternsHtml();
    
    // メッセージハンドラーを設定
    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'insertPattern':
            this.insertPattern(message.pattern);
            break;
          case 'copyPattern':
            this.copyPattern(message.pattern);
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );
    
    return panel;
  }
  
  /**
   * ドキュメント用のWebビューを作成
   */
  createDocumentationWebview(): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
      'ktnBridgeDocs',
      'ktn-bridge Documentation',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );
    
    panel.webview.html = this.getDocumentationHtml();
    
    return panel;
  }
  
  private getPreviewHtml(originalCode: string, transformedCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ktn-bridge Preview</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
          }
          .container {
            display: flex;
            gap: 20px;
            height: calc(100vh - 40px);
          }
          .panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            overflow: hidden;
          }
          .panel-header {
            background: var(--vscode-panel-background);
            padding: 12px 16px;
            border-bottom: 1px solid var(--vscode-panel-border);
            font-weight: 600;
          }
          .panel-content {
            flex: 1;
            overflow: auto;
          }
          pre {
            margin: 0;
            padding: 16px;
            background: var(--vscode-editor-background);
            overflow: auto;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            line-height: 1.5;
          }
          .original {
            border-left: 4px solid #3498db;
          }
          .transformed {
            border-left: 4px solid #2ecc71;
          }
          .toolbar {
            display: flex;
            gap: 8px;
            padding: 8px 16px;
            background: var(--vscode-tab-activeBackground);
            border-bottom: 1px solid var(--vscode-panel-border);
          }
          .btn {
            padding: 4px 8px;
            border: 1px solid var(--vscode-button-border);
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          }
          .btn:hover {
            background: var(--vscode-button-hoverBackground);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="panel original">
            <div class="panel-header">📝 Original Code (Web Standards)</div>
            <div class="toolbar">
              <button class="btn" onclick="copyCode('original')">📋 Copy</button>
              <button class="btn" onclick="formatCode('original')">✨ Format</button>
            </div>
            <div class="panel-content">
              <pre id="original-code"><code>${this.escapeHtml(originalCode)}</code></pre>
            </div>
          </div>
          <div class="panel transformed">
            <div class="panel-header">🔄 Transformed Code (kintone)</div>
            <div class="toolbar">
              <button class="btn" onclick="copyCode('transformed')">📋 Copy</button>
              <button class="btn" onclick="downloadCode()">💾 Download</button>
            </div>
            <div class="panel-content">
              <pre id="transformed-code"><code>${this.escapeHtml(transformedCode)}</code></pre>
            </div>
          </div>
        </div>
        
        <script>
          function copyCode(type) {
            const element = document.getElementById(type + '-code');
            navigator.clipboard.writeText(element.textContent);
          }
          
          function formatCode(type) {
            // 簡易的なフォーマット（実際にはプリティファイを使用）
            const element = document.getElementById(type + '-code');
            const formatted = element.textContent.replace(/;/g, ';\\n').replace(/{/g, '{\\n');
            element.textContent = formatted;
          }
          
          function downloadCode() {
            const code = document.getElementById('transformed-code').textContent;
            const blob = new Blob([code], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'customize.js';
            a.click();
            URL.revokeObjectURL(url);
          }
        </script>
      </body>
      </html>
    `;
  }
  
  private getPatternsHtml(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ktn-bridge Pattern Library</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
          }
          .header {
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            color: var(--vscode-titleBar-activeForeground);
          }
          .search-box {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .filters {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
          }
          .filter-btn {
            padding: 6px 12px;
            border: 1px solid var(--vscode-button-border);
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          }
          .filter-btn.active {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
          }
          .pattern {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            background: var(--vscode-panel-background);
          }
          .pattern-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          .pattern-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }
          .pattern-actions {
            display: flex;
            gap: 8px;
          }
          .action-btn {
            padding: 4px 8px;
            border: 1px solid var(--vscode-button-border);
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          }
          .action-btn:hover {
            background: var(--vscode-button-hoverBackground);
          }
          .pattern-meta {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
          }
          .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }
          .badge.beginner {
            background: rgba(40, 167, 69, 0.2);
            color: #28a745;
          }
          .badge.intermediate {
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
          }
          .badge.advanced {
            background: rgba(220, 53, 69, 0.2);
            color: #dc3545;
          }
          .pattern-description {
            margin-bottom: 15px;
            line-height: 1.6;
          }
          .code-example {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            margin: 10px 0;
            overflow: hidden;
          }
          .code-header {
            background: var(--vscode-tab-activeBackground);
            padding: 8px 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
            font-size: 12px;
            font-weight: 600;
          }
          .code-content {
            padding: 12px;
            overflow-x: auto;
          }
          .code-content pre {
            margin: 0;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📚 ktn-bridge Pattern Library</h1>
          <input type="text" class="search-box" placeholder="Search patterns..." oninput="searchPatterns(event)">
          <div class="filters">
            <button class="filter-btn active" onclick="filterPatterns('all')">All</button>
            <button class="filter-btn" onclick="filterPatterns('beginner')">Beginner</button>
            <button class="filter-btn" onclick="filterPatterns('intermediate')">Intermediate</button>
            <button class="filter-btn" onclick="filterPatterns('advanced')">Advanced</button>
          </div>
        </div>
        
        <div id="patterns-container">
          ${this.generatePatternsHtml()}
        </div>
        
        <script>
          const vscode = acquireVsCodeApi();
          
          function insertPattern(pattern) {
            vscode.postMessage({
              command: 'insertPattern',
              pattern: pattern
            });
          }
          
          function copyPattern(pattern) {
            navigator.clipboard.writeText(pattern);
            vscode.postMessage({
              command: 'copyPattern',
              pattern: pattern
            });
          }
          
          function searchPatterns(event) {
            const searchTerm = event.target.value.toLowerCase();
            const patterns = document.querySelectorAll('.pattern');
            
            patterns.forEach(pattern => {
              const title = pattern.querySelector('.pattern-title').textContent.toLowerCase();
              const description = pattern.querySelector('.pattern-description').textContent.toLowerCase();
              
              if (title.includes(searchTerm) || description.includes(searchTerm)) {
                pattern.style.display = 'block';
              } else {
                pattern.style.display = 'none';
              }
            });
          }
          
          function filterPatterns(level) {
            const patterns = document.querySelectorAll('.pattern');
            const filterButtons = document.querySelectorAll('.filter-btn');
            
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            patterns.forEach(pattern => {
              if (level === 'all') {
                pattern.style.display = 'block';
              } else {
                const badge = pattern.querySelector('.badge.' + level);
                if (badge) {
                  pattern.style.display = 'block';
                } else {
                  pattern.style.display = 'none';
                }
              }
            });
          }
        </script>
      </body>
      </html>
    `;
  }
  
  private generatePatternsHtml(): string {
    const patterns = [
      {
        title: 'レコード一覧表示時の初期化',
        description: 'レコード一覧画面が表示された時の基本的な初期化処理',
        difficulty: 'beginner',
        code: `document.addEventListener('DOMContentLoaded', (event) => {
  const page = document.querySelector('[data-page="record-list"]');
  if (page) {
    console.log('レコード一覧が表示されました');
    // 初期化処理
  }
});`
      },
      {
        title: '自動保存機能',
        description: 'フィールドの値が変更された時に自動で保存する機能',
        difficulty: 'intermediate',
        code: `document.addEventListener('change', async (event) => {
  const target = event.target as HTMLInputElement;
  if (target.name === 'title') {
    await autoSave(target.name, target.value);
  }
});`
      },
      {
        title: '一括操作パターン',
        description: '複数のレコードを一括で操作する機能',
        difficulty: 'advanced',
        code: `document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('[data-action="bulk-edit"]')) {
    const selectedRecords = getSelectedRecords();
    const bulkEvent = new CustomEvent('bulkEditStart', {
      detail: { selectedRecords }
    });
    document.dispatchEvent(bulkEvent);
  }
});`
      }
    ];
    
    return patterns.map(pattern => `
      <div class="pattern">
        <div class="pattern-header">
          <h3 class="pattern-title">${pattern.title}</h3>
          <div class="pattern-actions">
            <button class="action-btn" onclick="insertPattern(\`${pattern.code.replace(/`/g, '\\`')}\`)">📝 Insert</button>
            <button class="action-btn" onclick="copyPattern(\`${pattern.code.replace(/`/g, '\\`')}\`)">📋 Copy</button>
          </div>
        </div>
        <div class="pattern-meta">
          <span class="badge ${pattern.difficulty}">${pattern.difficulty}</span>
        </div>
        <div class="pattern-description">
          ${pattern.description}
        </div>
        <div class="code-example">
          <div class="code-header">Web標準の書き方</div>
          <div class="code-content">
            <pre><code>${this.escapeHtml(pattern.code)}</code></pre>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  private getDocumentationHtml(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ktn-bridge Documentation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            line-height: 1.6;
          }
          .doc-header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--vscode-panel-border);
          }
          .doc-header h1 {
            margin: 0 0 10px 0;
            color: var(--vscode-titleBar-activeForeground);
          }
          .doc-section {
            margin-bottom: 40px;
          }
          .doc-section h2 {
            color: var(--vscode-titleBar-activeForeground);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
          }
          .mapping-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .mapping-table th,
          .mapping-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--vscode-panel-border);
          }
          .mapping-table th {
            background: var(--vscode-panel-background);
            font-weight: 600;
          }
          .code-block {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 16px;
            margin: 16px 0;
            overflow-x: auto;
          }
          .code-block pre {
            margin: 0;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
          }
        </style>
      </head>
      <body>
        <div class="doc-header">
          <h1>📚 ktn-bridge Documentation</h1>
          <p>kintoneカスタマイズ開発をWeb標準の方法で行うためのフレームワーク</p>
        </div>
        
        <div class="doc-section">
          <h2>🎯 概要</h2>
          <p>ktn-bridgeは、kintoneカスタマイズ開発を「普通のWeb開発」として行えるようにするフレームワークです。</p>
          <ul>
            <li><strong>開発時</strong>: 標準的なWeb開発として記述</li>
            <li><strong>ビルド時</strong>: kintone用コードに自動変換</li>
            <li><strong>本番時</strong>: 通常のkintoneカスタマイズとして動作</li>
          </ul>
        </div>
        
        <div class="doc-section">
          <h2>🔗 イベントマッピング</h2>
          <table class="mapping-table">
            <thead>
              <tr>
                <th>Web標準イベント</th>
                <th>kintoneイベント</th>
                <th>説明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>DOMContentLoaded</td>
                <td>app.record.index.show</td>
                <td>レコード一覧画面の表示完了時</td>
              </tr>
              <tr>
                <td>change</td>
                <td>app.record.edit.change</td>
                <td>フィールド値変更時</td>
              </tr>
              <tr>
                <td>submit</td>
                <td>app.record.edit.submit</td>
                <td>フォーム送信時</td>
              </tr>
              <tr>
                <td>beforeunload</td>
                <td>app.record.edit.change</td>
                <td>ページ離脱時の確認</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="doc-section">
          <h2>🌐 APIマッピング</h2>
          <table class="mapping-table">
            <thead>
              <tr>
                <th>Web標準API</th>
                <th>kintone API</th>
                <th>説明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>fetch('/api/records')</td>
                <td>kintone.api('/k/v1/records')</td>
                <td>レコード一覧取得</td>
              </tr>
              <tr>
                <td>fetch('/api/record')</td>
                <td>kintone.api('/k/v1/record')</td>
                <td>レコード詳細取得・更新</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="doc-section">
          <h2>💡 使用例</h2>
          <div class="code-block">
            <pre><code>// Web標準の書き方
document.addEventListener('DOMContentLoaded', async (event) => {
  const page = document.querySelector('[data-page="record-list"]');
  if (page) {
    const response = await fetch('/api/records?app=1');
    const data = await response.json();
    console.log(\`取得したレコード数: \${data.records.length}\`);
  }
});

// 変換されるkintoneコード
kintone.events.on('app.record.index.show', async (event) => {
  const response = await kintone.api('/k/v1/records', 'GET', {app: 1});
  console.log(\`取得したレコード数: \${response.records.length}\`);
  return event;
});</code></pre>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  private insertPattern(pattern: string): void {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const position = editor.selection.active;
      editor.edit(editBuilder => {
        editBuilder.insert(position, pattern);
      });
    }
  }
  
  private copyPattern(pattern: string): void {
    vscode.env.clipboard.writeText(pattern);
    vscode.window.showInformationMessage('Pattern copied to clipboard!');
  }
  
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  dispose(): void {
    // Cleanup if needed
  }
}