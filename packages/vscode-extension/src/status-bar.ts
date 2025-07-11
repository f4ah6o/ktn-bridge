import * as vscode from 'vscode';

export class KtnBridgeStatusBar {
  private statusBarItem: vscode.StatusBarItem;
  
  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    
    this.statusBarItem.command = 'ktn-bridge.showPatterns';
    this.statusBarItem.tooltip = 'ktn-bridge: Click to show pattern library';
    this.statusBarItem.show();
    
    this.updateStatus();
  }
  
  updateStatus(document?: vscode.TextDocument): void {
    if (!document) {
      this.statusBarItem.text = '$(gear) ktn-bridge';
      this.statusBarItem.tooltip = 'ktn-bridge: Ready';
      return;
    }
    
    const stats = this.analyzeDocument(document);
    
    if (stats.isKtnBridgeFile) {
      this.statusBarItem.text = `$(gear) ktn-bridge (${stats.eventCount} events, ${stats.apiCount} APIs)`;
      this.statusBarItem.tooltip = `ktn-bridge: ${stats.eventCount} events, ${stats.apiCount} API calls detected`;
    } else {
      this.statusBarItem.text = '$(gear) ktn-bridge';
      this.statusBarItem.tooltip = 'ktn-bridge: Not a ktn-bridge file';
    }
  }
  
  private analyzeDocument(document: vscode.TextDocument): {
    isKtnBridgeFile: boolean;
    eventCount: number;
    apiCount: number;
  } {
    const content = document.getText();
    
    // addEventListener の数をカウント
    const eventMatches = content.match(/addEventListener\s*\(/g);
    const eventCount = eventMatches ? eventMatches.length : 0;
    
    // fetch API の数をカウント
    const apiMatches = content.match(/fetch\s*\(/g);
    const apiCount = apiMatches ? apiMatches.length : 0;
    
    // ktn-bridge関連のファイルかどうか判定
    const isKtnBridgeFile = eventCount > 0 || 
                           apiCount > 0 || 
                           content.includes('document.querySelector') ||
                           content.includes('@ktn-bridge');
    
    return {
      isKtnBridgeFile,
      eventCount,
      apiCount
    };
  }
  
  dispose(): void {
    this.statusBarItem.dispose();
  }
}