import * as vscode from 'vscode';

export class KtnBridgeDiagnosticProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  
  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('ktn-bridge');
  }
  
  updateDiagnostics(document: vscode.TextDocument): void {
    if (!this.isKtnBridgeFile(document)) {
      return;
    }
    
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');
    
    lines.forEach((line, index) => {
      const range = new vscode.Range(index, 0, index, line.length);
      
      // 未サポートのイベントを検出
      this.checkUnsupportedEvents(line, index, diagnostics);
      
      // 未サポートのAPIを検出
      this.checkUnsupportedApis(line, index, diagnostics);
      
      // 非推奨APIを検出
      this.checkDeprecatedApis(line, index, diagnostics);
      
      // 潜在的な問題を検出
      this.checkPotentialIssues(line, index, diagnostics);
    });
    
    this.diagnosticCollection.set(document.uri, diagnostics);
  }
  
  private checkUnsupportedEvents(line: string, lineIndex: number, diagnostics: vscode.Diagnostic[]): void {
    const eventMatch = line.match(/addEventListener\s*\(\s*['"]([^'"]+)['"]/);
    if (!eventMatch) {
      return;
    }
    
    const eventName = eventMatch[1];
    const supportedEvents = [
      'DOMContentLoaded',
      'change',
      'submit',
      'beforeunload',
      'click'
    ];
    
    if (!supportedEvents.includes(eventName)) {
      const startPos = line.indexOf(eventName);
      const range = new vscode.Range(
        lineIndex,
        startPos,
        lineIndex,
        startPos + eventName.length
      );
      
      const diagnostic = new vscode.Diagnostic(
        range,
        `Event '${eventName}' is not supported by ktn-bridge. Supported events: ${supportedEvents.join(', ')}`,
        vscode.DiagnosticSeverity.Warning
      );
      
      diagnostic.code = 'ktn-bridge-unsupported-event';
      diagnostic.source = 'ktn-bridge';
      
      diagnostics.push(diagnostic);
    }
  }
  
  private checkUnsupportedApis(line: string, lineIndex: number, diagnostics: vscode.Diagnostic[]): void {
    const apiMatch = line.match(/fetch\s*\(\s*['"]([^'"]+)['"]/);
    if (!apiMatch) {
      return;
    }
    
    const apiPath = apiMatch[1];
    const supportedApis = [
      '/api/records',
      '/api/record'
    ];
    
    const isSupported = supportedApis.some(api => apiPath.startsWith(api));
    
    if (!isSupported) {
      const startPos = line.indexOf(apiPath);
      const range = new vscode.Range(
        lineIndex,
        startPos,
        lineIndex,
        startPos + apiPath.length
      );
      
      const diagnostic = new vscode.Diagnostic(
        range,
        `API path '${apiPath}' is not supported by ktn-bridge. Supported APIs: ${supportedApis.join(', ')}`,
        vscode.DiagnosticSeverity.Warning
      );
      
      diagnostic.code = 'ktn-bridge-unsupported-api';
      diagnostic.source = 'ktn-bridge';
      
      diagnostics.push(diagnostic);
    }
  }
  
  private checkDeprecatedApis(line: string, lineIndex: number, diagnostics: vscode.Diagnostic[]): void {
    const deprecatedPatterns = [
      {
        pattern: /XMLHttpRequest/,
        message: 'XMLHttpRequest is deprecated. Use fetch() instead for ktn-bridge compatibility.',
        severity: vscode.DiagnosticSeverity.Information
      },
      {
        pattern: /\.innerHTML\s*=/,
        message: 'Direct innerHTML assignment may cause issues. Consider using textContent or DOM manipulation methods.',
        severity: vscode.DiagnosticSeverity.Hint
      }
    ];
    
    deprecatedPatterns.forEach(({ pattern, message, severity }) => {
      const match = line.match(pattern);
      if (match) {
        const startPos = line.indexOf(match[0]);
        const range = new vscode.Range(
          lineIndex,
          startPos,
          lineIndex,
          startPos + match[0].length
        );
        
        const diagnostic = new vscode.Diagnostic(range, message, severity);
        diagnostic.code = 'ktn-bridge-deprecated';
        diagnostic.source = 'ktn-bridge';
        
        diagnostics.push(diagnostic);
      }
    });
  }
  
  private checkPotentialIssues(line: string, lineIndex: number, diagnostics: vscode.Diagnostic[]): void {
    // セレクターの問題を検出
    const selectorMatch = line.match(/querySelector\s*\(\s*['"]([^'"]+)['"]/);
    if (selectorMatch) {
      const selector = selectorMatch[1];
      
      // kintone固有のセレクターを推奨
      if (!selector.includes('[data-') && !selector.includes('.kintone-')) {
        const startPos = line.indexOf(selector);
        const range = new vscode.Range(
          lineIndex,
          startPos,
          lineIndex,
          startPos + selector.length
        );
        
        const diagnostic = new vscode.Diagnostic(
          range,
          `Consider using kintone-specific selectors like '[data-page]' or '.kintone-' classes for better compatibility.`,
          vscode.DiagnosticSeverity.Hint
        );
        
        diagnostic.code = 'ktn-bridge-selector-hint';
        diagnostic.source = 'ktn-bridge';
        
        diagnostics.push(diagnostic);
      }
    }
    
    // エラーハンドリングの問題を検出
    if (line.includes('fetch(') && !line.includes('try') && !line.includes('catch')) {
      const fetchPos = line.indexOf('fetch(');
      const range = new vscode.Range(
        lineIndex,
        fetchPos,
        lineIndex,
        fetchPos + 5
      );
      
      const diagnostic = new vscode.Diagnostic(
        range,
        'Consider adding error handling (try/catch) for fetch operations.',
        vscode.DiagnosticSeverity.Hint
      );
      
      diagnostic.code = 'ktn-bridge-error-handling';
      diagnostic.source = 'ktn-bridge';
      
      diagnostics.push(diagnostic);
    }
  }
  
  private isKtnBridgeFile(document: vscode.TextDocument): boolean {
    const content = document.getText();
    return content.includes('addEventListener') || 
           content.includes('fetch(') ||
           content.includes('document.querySelector') ||
           content.includes('@ktn-bridge');
  }
  
  dispose(): void {
    this.diagnosticCollection.dispose();
  }
}