import * as vscode from 'vscode';

export class KtnBridgeDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  
  provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
    const symbols: vscode.DocumentSymbol[] = [];
    const text = document.getText();
    const lines = text.split('\n');
    
    lines.forEach((line, index) => {
      const range = new vscode.Range(index, 0, index, line.length);
      
      // addEventListener のイベントハンドラーを検出
      const eventMatch = line.match(/addEventListener\s*\(\s*['"]([^'"]+)['"],/);
      if (eventMatch) {
        const eventName = eventMatch[1];
        const symbol = new vscode.DocumentSymbol(
          `Event: ${eventName}`,
          this.getKintoneEventMapping(eventName),
          vscode.SymbolKind.Event,
          range,
          range
        );
        symbols.push(symbol);
      }
      
      // fetch API 呼び出しを検出
      const fetchMatch = line.match(/fetch\s*\(\s*['"]([^'"]+)['"]/);
      if (fetchMatch) {
        const apiPath = fetchMatch[1];
        const symbol = new vscode.DocumentSymbol(
          `API: ${apiPath}`,
          this.getKintoneApiMapping(apiPath),
          vscode.SymbolKind.Method,
          range,
          range
        );
        symbols.push(symbol);
      }
      
      // カスタムイベントの定義を検出
      const customEventMatch = line.match(/new\s+CustomEvent\s*\(\s*['"]([^'"]+)['"]/);
      if (customEventMatch) {
        const eventName = customEventMatch[1];
        const symbol = new vscode.DocumentSymbol(
          `Custom Event: ${eventName}`,
          'カスタムイベント',
          vscode.SymbolKind.Event,
          range,
          range
        );
        symbols.push(symbol);
      }
      
      // kintone API 呼び出しを検出
      const kintoneApiMatch = line.match(/kintone\.api\s*\(\s*['"]([^'"]+)['"]/);
      if (kintoneApiMatch) {
        const apiPath = kintoneApiMatch[1];
        const symbol = new vscode.DocumentSymbol(
          `kintone API: ${apiPath}`,
          'kintone REST API',
          vscode.SymbolKind.Method,
          range,
          range
        );
        symbols.push(symbol);
      }
    });
    
    return symbols;
  }
  
  private getKintoneEventMapping(eventName: string): string {
    const mappings: { [key: string]: string } = {
      'DOMContentLoaded': 'app.record.index.show',
      'change': 'app.record.edit.change',
      'submit': 'app.record.edit.submit',
      'beforeunload': 'app.record.edit.change',
      'click': 'custom click handler'
    };
    
    return mappings[eventName] || 'unknown mapping';
  }
  
  private getKintoneApiMapping(apiPath: string): string {
    const mappings: { [key: string]: string } = {
      '/api/records': '/k/v1/records',
      '/api/record': '/k/v1/record',
      '/api/record/create': '/k/v1/record POST',
      '/api/record/update': '/k/v1/record PUT',
      '/api/record/delete': '/k/v1/records DELETE'
    };
    
    return mappings[apiPath] || 'unknown API';
  }
}