import * as vscode from 'vscode';

export class KtnBridgeCodeLensProvider implements vscode.CodeLensProvider {
  
  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const codeLenses: vscode.CodeLens[] = [];
    const text = document.getText();
    const lines = text.split('\n');
    
    lines.forEach((line, index) => {
      const range = new vscode.Range(index, 0, index, line.length);
      
      // addEventListener の行にCodeLensを追加
      if (line.includes('addEventListener')) {
        codeLenses.push(new vscode.CodeLens(range, {
          title: '🔍 Preview kintone code',
          command: 'ktn-bridge.preview'
        }));
      }
      
      // fetch の行にCodeLensを追加
      if (line.includes('fetch(')) {
        codeLenses.push(new vscode.CodeLens(range, {
          title: '🔍 Preview API mapping',
          command: 'ktn-bridge.preview'
        }));
      }
      
      // kintone関連のコメントを検出
      if (line.includes('// kintone:') || line.includes('/* kintone:')) {
        codeLenses.push(new vscode.CodeLens(range, {
          title: '📚 Show documentation',
          command: 'ktn-bridge.generateDocs'
        }));
      }
    });
    
    return codeLenses;
  }
}