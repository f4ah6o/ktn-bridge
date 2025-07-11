import * as vscode from 'vscode';

export class KtnBridgeDefinitionProvider implements vscode.DefinitionProvider {
  
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
    
    const range = document.getWordRangeAtPosition(position);
    if (!range) {
      return null;
    }
    
    const word = document.getText(range);
    const line = document.lineAt(position).text;
    
    // Web標準のイベントからkintoneイベントの定義へ
    if (line.includes('addEventListener')) {
      return this.getEventDefinition(word, document, range);
    }
    
    // fetch APIからkintone APIの定義へ
    if (line.includes('fetch(')) {
      return this.getApiDefinition(word, document, range);
    }
    
    return null;
  }
  
  private getEventDefinition(
    word: string,
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.LocationLink[] | null {
    
    const eventMappings: { [key: string]: string } = {
      'DOMContentLoaded': 'app.record.index.show',
      'change': 'app.record.edit.change',
      'submit': 'app.record.edit.submit',
      'beforeunload': 'app.record.edit.change',
      'click': 'custom click handler'
    };
    
    const kintoneEvent = eventMappings[word];
    if (!kintoneEvent) {
      return null;
    }
    
    // 仮想的な定義位置を作成（実際にはkintoneイベントの説明を表示）
    const definitionUri = vscode.Uri.parse(`ktn-bridge-event:${kintoneEvent}`);
    
    return [{
      targetUri: definitionUri,
      targetRange: new vscode.Range(0, 0, 0, 0),
      targetSelectionRange: new vscode.Range(0, 0, 0, 0),
      originSelectionRange: range
    }];
  }
  
  private getApiDefinition(
    word: string,
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.LocationLink[] | null {
    
    const line = document.lineAt(range.start.line).text;
    const apiMatch = line.match(/['"]([^'"]*api[^'"]*)['"]/);
    
    if (!apiMatch) {
      return null;
    }
    
    const apiPath = apiMatch[1];
    const apiMappings: { [key: string]: string } = {
      '/api/records': '/k/v1/records',
      '/api/record': '/k/v1/record'
    };
    
    const kintoneApi = apiMappings[apiPath];
    if (!kintoneApi) {
      return null;
    }
    
    // 仮想的な定義位置を作成（実際にはkintone APIの説明を表示）
    const definitionUri = vscode.Uri.parse(`ktn-bridge-api:${kintoneApi}`);
    
    return [{
      targetUri: definitionUri,
      targetRange: new vscode.Range(0, 0, 0, 0),
      targetSelectionRange: new vscode.Range(0, 0, 0, 0),
      originSelectionRange: range
    }];
  }
}