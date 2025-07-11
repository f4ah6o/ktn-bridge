import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';

export class KtnBridgeExtension {
  private context: vscode.ExtensionContext;
  private outputChannel: vscode.OutputChannel;
  private devServerProcess: any;
  private statusBarItem: vscode.StatusBarItem;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.outputChannel = vscode.window.createOutputChannel('ktn-bridge');
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.statusBarItem.show();
    
    this.updateStatusBar('Ready');
    
    // 破棄時の処理
    context.subscriptions.push(
      this.outputChannel,
      this.statusBarItem,
      {
        dispose: () => {
          if (this.devServerProcess) {
            this.devServerProcess.kill();
          }
        }
      }
    );
  }

  /**
   * 新しいktn-bridgeプロジェクトを初期化
   */
  async initProject() {
    try {
      this.updateStatusBar('Initializing...');
      this.outputChannel.show();
      this.outputChannel.appendLine('🚀 Initializing ktn-bridge project...');

      // プロジェクト名を入力
      const projectName = await vscode.window.showInputBox({
        prompt: 'Enter project name',
        value: 'my-ktn-bridge-app',
        validateInput: (value) => {
          if (!value || value.trim() === '') {
            return 'Project name is required';
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
            return 'Project name can only contain letters, numbers, hyphens, and underscores';
          }
          return null;
        }
      });

      if (!projectName) {
        this.updateStatusBar('Ready');
        return;
      }

      // 現在のワークスペースフォルダーを取得
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        this.updateStatusBar('Ready');
        return;
      }

      // ktn-b initコマンドを実行
      const projectPath = path.join(workspaceFolder.uri.fsPath, projectName);
      
      await this.executeCommand('ktn-b', ['init', projectName], workspaceFolder.uri.fsPath);
      
      this.outputChannel.appendLine(`✅ Project initialized at: ${projectPath}`);
      this.updateStatusBar('Ready');
      
      // 新しいプロジェクトをVS Codeで開くかどうか確認
      const openProject = await vscode.window.showInformationMessage(
        `Project "${projectName}" created successfully!`,
        'Open Project',
        'Stay Here'
      );
      
      if (openProject === 'Open Project') {
        const uri = vscode.Uri.file(projectPath);
        await vscode.commands.executeCommand('vscode.openFolder', uri);
      }
      
    } catch (error) {
      this.outputChannel.appendLine(`❌ Error: ${error}`);
      vscode.window.showErrorMessage(`Failed to initialize project: ${error}`);
      this.updateStatusBar('Ready');
    }
  }

  /**
   * 開発サーバーを起動
   */
  async startDevServer() {
    try {
      if (this.devServerProcess) {
        // 既に起動している場合は停止
        await this.stopDevServer();
      }

      this.updateStatusBar('Starting dev server...');
      this.outputChannel.show();
      this.outputChannel.appendLine('🚀 Starting development server...');

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        this.updateStatusBar('Ready');
        return;
      }

      // package.jsonの存在確認
      const packageJsonPath = path.join(workspaceFolder.uri.fsPath, 'package.json');
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(packageJsonPath));
      } catch {
        vscode.window.showErrorMessage('No package.json found. Please initialize a ktn-bridge project first.');
        this.updateStatusBar('Ready');
        return;
      }

      // pnpm devコマンドを実行
      this.devServerProcess = spawn('pnpm', ['dev'], {
        cwd: workspaceFolder.uri.fsPath,
        stdio: 'pipe'
      });

      this.devServerProcess.stdout.on('data', (data: Buffer) => {
        this.outputChannel.appendLine(data.toString());
        
        // サーバー起動完了の検出
        if (data.toString().includes('Local:')) {
          this.updateStatusBar('Dev server running');
          vscode.window.showInformationMessage('Development server started! 🎉');
        }
      });

      this.devServerProcess.stderr.on('data', (data: Buffer) => {
        this.outputChannel.appendLine(`Error: ${data.toString()}`);
      });

      this.devServerProcess.on('close', (code: number) => {
        this.outputChannel.appendLine(`Dev server exited with code ${code}`);
        this.updateStatusBar('Ready');
        this.devServerProcess = null;
      });

      this.devServerProcess.on('error', (error: Error) => {
        this.outputChannel.appendLine(`Failed to start dev server: ${error.message}`);
        vscode.window.showErrorMessage(`Failed to start dev server: ${error.message}`);
        this.updateStatusBar('Ready');
        this.devServerProcess = null;
      });

    } catch (error) {
      this.outputChannel.appendLine(`❌ Error: ${error}`);
      vscode.window.showErrorMessage(`Failed to start dev server: ${error}`);
      this.updateStatusBar('Ready');
    }
  }

  /**
   * 開発サーバーを停止
   */
  async stopDevServer() {
    if (this.devServerProcess) {
      this.outputChannel.appendLine('🛑 Stopping development server...');
      this.devServerProcess.kill();
      this.devServerProcess = null;
      this.updateStatusBar('Ready');
      vscode.window.showInformationMessage('Development server stopped');
    }
  }

  /**
   * プロジェクトをビルド
   */
  async buildProject() {
    try {
      this.updateStatusBar('Building...');
      this.outputChannel.show();
      this.outputChannel.appendLine('🔨 Building project...');

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        this.updateStatusBar('Ready');
        return;
      }

      await this.executeCommand('pnpm', ['build'], workspaceFolder.uri.fsPath);
      
      this.outputChannel.appendLine('✅ Build completed successfully!');
      this.updateStatusBar('Ready');
      vscode.window.showInformationMessage('Build completed successfully! 🎉');

    } catch (error) {
      this.outputChannel.appendLine(`❌ Build failed: ${error}`);
      vscode.window.showErrorMessage(`Build failed: ${error}`);
      this.updateStatusBar('Ready');
    }
  }

  /**
   * 変換されたコードをプレビュー
   */
  async previewTransformedCode() {
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
      }

      const document = editor.document;
      if (document.languageId !== 'typescript' && document.languageId !== 'javascript') {
        vscode.window.showWarningMessage('Please open a TypeScript or JavaScript file');
        return;
      }

      this.outputChannel.appendLine('🔍 Previewing transformed code...');
      
      // 変換プレビュー用のWebビューを作成
      const panel = vscode.window.createWebviewPanel(
        'ktnBridgePreview',
        'ktn-bridge Preview',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      // 現在のコードを取得
      const originalCode = document.getText();
      
      // 変換されたコードを生成（簡易版）
      const transformedCode = this.mockTransform(originalCode);
      
      // HTML内容を設定
      panel.webview.html = this.getPreviewHtml(originalCode, transformedCode);
      
    } catch (error) {
      this.outputChannel.appendLine(`❌ Preview failed: ${error}`);
      vscode.window.showErrorMessage(`Preview failed: ${error}`);
    }
  }

  /**
   * TypeScript型定義を生成
   */
  async generateTypes() {
    try {
      this.updateStatusBar('Generating types...');
      this.outputChannel.show();
      this.outputChannel.appendLine('📝 Generating TypeScript types...');

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        this.updateStatusBar('Ready');
        return;
      }

      // 型定義生成のコマンドを実行
      await this.executeCommand('pnpm', ['ktn-b', 'types'], workspaceFolder.uri.fsPath);
      
      this.outputChannel.appendLine('✅ Types generated successfully!');
      this.updateStatusBar('Ready');
      vscode.window.showInformationMessage('Types generated successfully! 🎉');

    } catch (error) {
      this.outputChannel.appendLine(`❌ Type generation failed: ${error}`);
      vscode.window.showErrorMessage(`Type generation failed: ${error}`);
      this.updateStatusBar('Ready');
    }
  }

  /**
   * ドキュメントを生成
   */
  async generateDocs() {
    try {
      this.updateStatusBar('Generating docs...');
      this.outputChannel.show();
      this.outputChannel.appendLine('📚 Generating documentation...');

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        this.updateStatusBar('Ready');
        return;
      }

      // ドキュメント生成のコマンドを実行
      await this.executeCommand('pnpm', ['ktn-b', 'docs'], workspaceFolder.uri.fsPath);
      
      this.outputChannel.appendLine('✅ Documentation generated successfully!');
      this.updateStatusBar('Ready');
      vscode.window.showInformationMessage('Documentation generated successfully! 🎉');

    } catch (error) {
      this.outputChannel.appendLine(`❌ Documentation generation failed: ${error}`);
      vscode.window.showErrorMessage(`Documentation generation failed: ${error}`);
      this.updateStatusBar('Ready');
    }
  }

  /**
   * パターンライブラリを表示
   */
  async showPatterns() {
    try {
      this.outputChannel.appendLine('📖 Opening pattern library...');
      
      // パターンライブラリ用のWebビューを作成
      const panel = vscode.window.createWebviewPanel(
        'ktnBridgePatterns',
        'ktn-bridge Pattern Library',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      // パターンライブラリのHTML内容を設定
      panel.webview.html = this.getPatternsHtml();
      
    } catch (error) {
      this.outputChannel.appendLine(`❌ Failed to show patterns: ${error}`);
      vscode.window.showErrorMessage(`Failed to show patterns: ${error}`);
    }
  }

  /**
   * 設定を更新
   */
  updateConfiguration() {
    this.outputChannel.appendLine('⚙️ Configuration updated');
  }

  /**
   * 破棄処理
   */
  dispose() {
    if (this.devServerProcess) {
      this.devServerProcess.kill();
    }
  }

  /**
   * ステータスバーを更新
   */
  private updateStatusBar(status: string) {
    this.statusBarItem.text = `$(gear) ktn-bridge: ${status}`;
    this.statusBarItem.tooltip = `ktn-bridge Status: ${status}`;
  }

  /**
   * コマンドを実行
   */
  private executeCommand(command: string, args: string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { cwd, stdio: 'pipe' });
      
      process.stdout.on('data', (data) => {
        this.outputChannel.appendLine(data.toString());
      });
      
      process.stderr.on('data', (data) => {
        this.outputChannel.appendLine(`Error: ${data.toString()}`);
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * 簡易的な変換処理（モック）
   */
  private mockTransform(code: string): string {
    let transformed = code;
    
    // 基本的な変換例
    transformed = transformed.replace(
      /document\.addEventListener\s*\(\s*['"]DOMContentLoaded['"],\s*(.+?)\)/gs,
      'kintone.events.on(\'app.record.index.show\', $1)'
    );
    
    transformed = transformed.replace(
      /fetch\s*\(\s*['"]\/api\/records['"],?\s*(.+?)\)/gs,
      'kintone.api(\'/k/v1/records\', \'GET\', $1)'
    );
    
    return transformed;
  }

  /**
   * プレビューHTML生成
   */
  private getPreviewHtml(originalCode: string, transformedCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ktn-bridge Preview</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; }
          .container { display: flex; gap: 20px; height: 100vh; }
          .panel { flex: 1; display: flex; flex-direction: column; }
          .panel h2 { margin-top: 0; padding: 10px; background: #f0f0f0; border-radius: 4px; }
          .code-block { flex: 1; overflow: auto; border: 1px solid #ddd; border-radius: 4px; }
          pre { margin: 0; padding: 15px; background: #f8f8f8; overflow: auto; }
          code { font-family: 'Monaco', 'Consolas', monospace; font-size: 14px; }
          .original { border-left: 4px solid #3498db; }
          .transformed { border-left: 4px solid #2ecc71; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="panel">
            <h2>📝 Original Code (Web Standards)</h2>
            <div class="code-block original">
              <pre><code>${this.escapeHtml(originalCode)}</code></pre>
            </div>
          </div>
          <div class="panel">
            <h2>🔄 Transformed Code (kintone)</h2>
            <div class="code-block transformed">
              <pre><code>${this.escapeHtml(transformedCode)}</code></pre>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * パターンライブラリHTML生成
   */
  private getPatternsHtml(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ktn-bridge Pattern Library</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; }
          .pattern { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .pattern h3 { margin-top: 0; color: #2c3e50; }
          .pattern-meta { display: flex; gap: 10px; margin-bottom: 10px; }
          .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .badge.beginner { background: #d4edda; color: #155724; }
          .badge.intermediate { background: #fff3cd; color: #856404; }
          .badge.advanced { background: #f8d7da; color: #721c24; }
          .code-example { background: #f8f8f8; padding: 15px; border-radius: 4px; margin: 10px 0; }
          .code-example pre { margin: 0; }
          .code-example code { font-family: 'Monaco', 'Consolas', monospace; font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>📚 ktn-bridge Pattern Library</h1>
        
        <div class="pattern">
          <h3>レコード一覧表示時の初期化</h3>
          <div class="pattern-meta">
            <span class="badge beginner">beginner</span>
            <span class="badge">initialization</span>
          </div>
          <p>レコード一覧画面が表示された時の基本的な初期化処理</p>
          <div class="code-example">
            <strong>Web標準の書き方:</strong>
            <pre><code>document.addEventListener('DOMContentLoaded', (event) => {
  const page = document.querySelector('[data-page="record-list"]');
  if (page) {
    console.log('レコード一覧が表示されました');
    // 初期化処理
  }
});</code></pre>
          </div>
        </div>
        
        <div class="pattern">
          <h3>自動保存機能</h3>
          <div class="pattern-meta">
            <span class="badge intermediate">intermediate</span>
            <span class="badge">auto-save</span>
          </div>
          <p>フィールドの値が変更された時に自動で保存する機能</p>
          <div class="code-example">
            <strong>Web標準の書き方:</strong>
            <pre><code>document.addEventListener('change', async (event) => {
  const target = event.target as HTMLInputElement;
  if (target.name === 'title') {
    await autoSave(target.name, target.value);
  }
});</code></pre>
          </div>
        </div>
        
        <div class="pattern">
          <h3>一括操作パターン</h3>
          <div class="pattern-meta">
            <span class="badge advanced">advanced</span>
            <span class="badge">bulk-operations</span>
          </div>
          <p>複数のレコードを一括で操作する機能</p>
          <div class="code-example">
            <strong>Web標準の書き方:</strong>
            <pre><code>document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('[data-action="bulk-edit"]')) {
    const selectedRecords = getSelectedRecords();
    const bulkEvent = new CustomEvent('bulkEditStart', {
      detail: { selectedRecords }
    });
    document.dispatchEvent(bulkEvent);
  }
});</code></pre>
          </div>
        </div>
        
      </body>
      </html>
    `;
  }

  /**
   * HTMLエスケープ
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}