import * as vscode from 'vscode';
import { KtnBridgeExtension } from './ktn-bridge-extension';
import { KtnBridgeCodeLensProvider } from './providers/code-lens-provider';
import { KtnBridgeHoverProvider } from './providers/hover-provider';
import { KtnBridgeCompletionProvider } from './providers/completion-provider';
import { KtnBridgeDocumentSymbolProvider } from './providers/document-symbol-provider';
import { KtnBridgeDefinitionProvider } from './providers/definition-provider';
import { KtnBridgeDiagnosticProvider } from './providers/diagnostic-provider';
import { KtnBridgeStatusBar } from './status-bar';
import { KtnBridgeWebviewProvider } from './webview-provider';

let extension: KtnBridgeExtension;

export function activate(context: vscode.ExtensionContext) {
  console.log('🚀 ktn-bridge extension is now active!');
  
  // メイン拡張機能インスタンスを作成
  extension = new KtnBridgeExtension(context);
  
  // ステータスバーを初期化
  const statusBar = new KtnBridgeStatusBar();
  
  // 診断プロバイダーを初期化
  const diagnosticProvider = new KtnBridgeDiagnosticProvider();
  
  // Webビュープロバイダーを初期化
  const webviewProvider = new KtnBridgeWebviewProvider(context);
  
  // 言語サポートプロバイダーを登録
  const providers = [
    // CodeLens プロバイダー
    vscode.languages.registerCodeLensProvider(
      { language: 'typescript' },
      new KtnBridgeCodeLensProvider()
    ),
    vscode.languages.registerCodeLensProvider(
      { language: 'javascript' },
      new KtnBridgeCodeLensProvider()
    ),
    
    // Hover プロバイダー
    vscode.languages.registerHoverProvider(
      { language: 'typescript' },
      new KtnBridgeHoverProvider()
    ),
    vscode.languages.registerHoverProvider(
      { language: 'javascript' },
      new KtnBridgeHoverProvider()
    ),
    
    // Completion プロバイダー
    vscode.languages.registerCompletionItemProvider(
      { language: 'typescript' },
      new KtnBridgeCompletionProvider(),
      '.'
    ),
    vscode.languages.registerCompletionItemProvider(
      { language: 'javascript' },
      new KtnBridgeCompletionProvider(),
      '.'
    ),
    
    // Document Symbol プロバイダー
    vscode.languages.registerDocumentSymbolProvider(
      { language: 'typescript' },
      new KtnBridgeDocumentSymbolProvider()
    ),
    vscode.languages.registerDocumentSymbolProvider(
      { language: 'javascript' },
      new KtnBridgeDocumentSymbolProvider()
    ),
    
    // Definition プロバイダー
    vscode.languages.registerDefinitionProvider(
      { language: 'typescript' },
      new KtnBridgeDefinitionProvider()
    ),
    vscode.languages.registerDefinitionProvider(
      { language: 'javascript' },
      new KtnBridgeDefinitionProvider()
    )
  ];
  
  // コマンドを登録
  const commands = [
    vscode.commands.registerCommand('ktn-bridge.init', () => {
      extension.initProject();
    }),
    
    vscode.commands.registerCommand('ktn-bridge.dev', () => {
      extension.startDevServer();
    }),
    
    vscode.commands.registerCommand('ktn-bridge.build', () => {
      extension.buildProject();
    }),
    
    vscode.commands.registerCommand('ktn-bridge.preview', () => {
      extension.previewTransformedCode();
    }),
    
    vscode.commands.registerCommand('ktn-bridge.generateTypes', () => {
      extension.generateTypes();
    }),
    
    vscode.commands.registerCommand('ktn-bridge.generateDocs', () => {
      extension.generateDocs();
    }),
    
    vscode.commands.registerCommand('ktn-bridge.showPatterns', () => {
      extension.showPatterns();
    })
  ];
  
  // イベントリスナーを登録
  const eventListeners = [
    // ファイル保存時の処理
    vscode.workspace.onDidSaveTextDocument((document) => {
      if (isKtnBridgeFile(document)) {
        diagnosticProvider.updateDiagnostics(document);
        if (vscode.workspace.getConfiguration('ktn-bridge').get('autoPreview')) {
          extension.previewTransformedCode();
        }
      }
    }),
    
    // エディタ変更時の処理
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && isKtnBridgeFile(editor.document)) {
        statusBar.updateStatus(editor.document);
      }
    }),
    
    // 設定変更時の処理
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('ktn-bridge')) {
        extension.updateConfiguration();
      }
    })
  ];
  
  // すべてのdisposableをcontextに追加
  context.subscriptions.push(
    ...providers,
    ...commands,
    ...eventListeners,
    statusBar,
    diagnosticProvider,
    webviewProvider
  );
  
  // 初期化完了メッセージ
  vscode.window.showInformationMessage('ktn-bridge extension is ready! 🎉');
}

export function deactivate() {
  console.log('👋 ktn-bridge extension is deactivating...');
  
  if (extension) {
    extension.dispose();
  }
}

/**
 * ktn-bridge関連のファイルかどうかを判定
 */
function isKtnBridgeFile(document: vscode.TextDocument): boolean {
  const fileName = document.fileName;
  const languageId = document.languageId;
  
  // 言語IDチェック
  if (languageId === 'ktn-bridge') {
    return true;
  }
  
  // TypeScript/JavaScriptファイルの場合
  if (languageId === 'typescript' || languageId === 'javascript') {
    // ktn-bridge設定ファイルの存在チェック
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (workspaceFolder) {
      const configFiles = [
        'ktn-bridge.config.ts',
        'ktn-bridge.config.js',
        'vite.config.ts',
        'vite.config.js'
      ];
      
      return configFiles.some(configFile => {
        const configPath = vscode.Uri.joinPath(workspaceFolder.uri, configFile);
        return vscode.workspace.fs.stat(configPath).then(
          () => true,
          () => false
        );
      });
    }
    
    // ファイル内容でktn-bridge関連のコードを検出
    const content = document.getText();
    return content.includes('addEventListener') || 
           content.includes('document.querySelector') ||
           content.includes('fetch(') ||
           content.includes('@ktn-bridge');
  }
  
  return false;
}