/**
 * ktn-bridge デバッグ支援機能
 * 開発時のデバッグを支援するためのユーティリティ
 */

export interface DebugOptions {
  enableSourceMap?: boolean;
  enableTransformTrace?: boolean;
  enableErrorDetails?: boolean;
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug';
  outputFile?: string;
}

export interface TransformTrace {
  originalCode: string;
  transformedCode: string;
  sourceMap?: string;
  mappings?: Array<{
    original: { line: number; column: number };
    transformed: { line: number; column: number };
    name?: string;
  }>;
  timestamp: string;
  filename: string;
  transformDuration: number;
  transformedAt: string;
}

export interface DebugInfo {
  eventMappings: Array<{
    webEvent: string;
    kintoneEvent: string;
    location: { line: number; column: number };
    success: boolean;
    error?: string;
  }>;
  apiMappings: Array<{
    webUrl: string;
    kintoneApi: string;
    method: string;
    location?: { line: number; column: number };
    success: boolean;
    error?: string;
  }>;
  transformTrace?: TransformTrace;
  errors: Array<{
    message: string;
    location: { line: number; column: number };
    severity: 'error' | 'warning' | 'info';
    code: string;
    suggestions?: string[];
  }>;
}

export class DebugHelper {
  private options: DebugOptions;
  private transformTraces: TransformTrace[] = [];
  private debugInfo: DebugInfo[] = [];

  constructor(options: DebugOptions = {}) {
    this.options = {
      enableSourceMap: true,
      enableTransformTrace: true,
      enableErrorDetails: true,
      logLevel: 'info',
      ...options
    };
  }

  /**
   * 変換トレースを記録
   */
  recordTransformTrace(trace: TransformTrace): void {
    if (!this.options.enableTransformTrace) {
      return;
    }

    this.transformTraces.push(trace);
    
    // 最新の100件のみ保持
    if (this.transformTraces.length > 100) {
      this.transformTraces.shift();
    }

    this.log('debug', `Transform trace recorded for ${trace.filename}`);
  }

  /**
   * デバッグ情報を記録
   */
  recordDebugInfo(info: DebugInfo): void {
    this.debugInfo.push(info);
    
    // 最新の50件のみ保持
    if (this.debugInfo.length > 50) {
      this.debugInfo.shift();
    }

    this.log('info', `Debug info recorded - ${info.eventMappings.length} events, ${info.apiMappings.length} APIs`);
  }

  /**
   * エラーの詳細情報を生成
   */
  generateErrorDetails(error: Error, context: {
    filename: string;
    line?: number;
    column?: number;
    code?: string;
  }): string {
    if (!this.options.enableErrorDetails) {
      return error.message;
    }

    const details = [
      `Error: ${error.message}`,
      `File: ${context.filename}`,
      context.line ? `Line: ${context.line}` : '',
      context.column ? `Column: ${context.column}` : '',
      context.code ? `Code: ${context.code}` : '',
      `Stack: ${error.stack}`
    ].filter(Boolean);

    return details.join('\n');
  }

  /**
   * 変換デバッグレポートを生成
   */
  generateTransformReport(filename: string): string {
    if (!this.options.enableTransformTrace) {
      return `Transform trace not enabled`;
    }

    const trace = this.transformTraces.find(t => t.filename === filename);
    if (!trace) {
      return `No transform trace found for ${filename}`;
    }

    const report = [
      `Transform Report: ${filename}`,
      `Timestamp: ${trace.timestamp}`,
      `Duration: ${trace.transformDuration}ms`,
      ``,
      `Original Code:`,
      `${trace.originalCode}`,
      ``,
      `Transformed Code:`,
      `${trace.transformedCode}`,
      ``
    ];

    if (trace.mappings && trace.mappings.length > 0) {
      report.push(`Mappings:`);
      report.push(...trace.mappings.map(m => 
        `  ${m.original.line}:${m.original.column} → ${m.transformed.line}:${m.transformed.column}${m.name ? ` (${m.name})` : ''}`
      ));
    }

    if (trace.sourceMap) {
      report.push(``, `Source Map:`, trace.sourceMap);
    }

    return report.join('\n');
  }

  /**
   * 変換の比較レポートを生成
   */
  generateComparisonReport(originalCode: string, transformedCode: string): string {
    const originalLines = originalCode.split('\n');
    const transformedLines = transformedCode.split('\n');

    const report = [
      `=== Code Comparison Report ===`,
      `Original: ${originalLines.length} lines`,
      `Transformed: ${transformedLines.length} lines`,
      ``,
      `Side-by-side comparison:`,
      ``
    ];

    const maxLines = Math.max(originalLines.length, transformedLines.length);
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const transformedLine = transformedLines[i] || '';
      const lineNum = (i + 1).toString().padStart(3, ' ');
      
      report.push(`${lineNum} | ${originalLine.padEnd(50)} | ${transformedLine}`);
    }

    return report.join('\n');
  }

  /**
   * 問題の診断レポートを生成
   */
  generateDiagnosticReport(): string {
    const allErrors = this.debugInfo.flatMap(info => info.errors);
    const allEventMappings = this.debugInfo.flatMap(info => info.eventMappings);
    const allApiMappings = this.debugInfo.flatMap(info => info.apiMappings);
    
    const errorCounts = allErrors.reduce((counts, error) => {
      counts[error.severity] = (counts[error.severity] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const report = [
      `Diagnostic Report`,
      `Event Mappings: ${allEventMappings.length}`,
      `API Mappings: ${allApiMappings.length}`,
      `Errors: ${allErrors.length}`,
      ``,
      `Event Mapping Details:`,
      ...allEventMappings.slice(0, 3).map(mapping => 
        `  ${mapping.webEvent} → ${mapping.kintoneEvent} (${mapping.success ? 'Success' : 'Failed'})`
      ),
      ``,
      `API Mapping Details:`,
      ...allApiMappings.slice(0, 3).map(mapping => 
        `  ${mapping.webUrl} → ${mapping.kintoneApi} (${mapping.success ? 'Success' : 'Failed'})`
      ),
      ``,
      `Recent Issues:`,
      ...allErrors.slice(-3).map(error => 
        `  ${error.severity ? error.severity.toUpperCase() : 'ERROR'}: ${error.message}`
      )
    ];

    return report.join('\n');
  }

  /**
   * パフォーマンス統計を生成
   */
  generatePerformanceReport(): string {
    const now = new Date();
    const recentTraces = this.transformTraces.filter(trace => {
      const traceTime = new Date(trace.timestamp);
      return now.getTime() - traceTime.getTime() < 5 * 60 * 1000; // 5分以内
    });

    const avgOriginalSize = recentTraces.reduce((sum, trace) => sum + trace.originalCode.length, 0) / recentTraces.length;
    const avgTransformedSize = recentTraces.reduce((sum, trace) => sum + trace.transformedCode.length, 0) / recentTraces.length;

    const report = [
      `=== Performance Report ===`,
      `Recent transforms: ${recentTraces.length}`,
      `Average original size: ${Math.round(avgOriginalSize)} chars`,
      `Average transformed size: ${Math.round(avgTransformedSize)} chars`,
      `Size ratio: ${((avgTransformedSize / avgOriginalSize) * 100).toFixed(1)}%`,
      ``,
      `Transform times:`,
      ...recentTraces.slice(-5).map(trace => 
        `  ${trace.filename}: ${trace.timestamp}`
      )
    ];

    return report.join('\n');
  }

  /**
   * デバッグ情報をファイルに出力
   */
  async exportDebugInfo(filename: string): Promise<void> {
    const report = [
      this.generateDiagnosticReport(),
      ``,
      this.generatePerformanceReport(),
      ``,
      `=== All Transform Traces ===`,
      ...this.transformTraces.map(trace => this.generateTransformReport(trace.filename))
    ].join('\n');

    // Node.js環境でのファイル出力
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      const path = require('path');
      
      const outputPath = path.resolve(filename);
      fs.writeFileSync(outputPath, report, 'utf8');
      this.log('info', `Debug info exported to ${outputPath}`);
    } else {
      // ブラウザ環境では console.log
      console.log(report);
    }
  }

  /**
   * 変換の妥当性をチェック
   */
  validateTransform(originalCode: string, transformedCode: string): Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
  }> {
    const issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      suggestion?: string;
    }> = [];

    // 基本的な構文チェック
    if (!transformedCode.includes('kintone.')) {
      issues.push({
        type: 'warning',
        message: 'Transformed code does not contain kintone API calls',
        suggestion: 'Check if Web standard APIs are properly mapped to kintone APIs'
      });
    }

    // addEventListener → kintone.events.on の変換チェック
    const originalEvents = (originalCode.match(/addEventListener/g) || []).length;
    const transformedEvents = (transformedCode.match(/kintone\.events\.on/g) || []).length;
    
    if (originalEvents > 0 && transformedEvents === 0) {
      issues.push({
        type: 'error',
        message: 'Event listeners not properly transformed',
        suggestion: 'Check event mapping configuration'
      });
    }

    // fetch → kintone.api の変換チェック
    const originalFetch = (originalCode.match(/fetch\s*\(/g) || []).length;
    const transformedApi = (transformedCode.match(/kintone\.api\s*\(/g) || []).length;
    
    if (originalFetch > 0 && transformedApi === 0) {
      issues.push({
        type: 'error',
        message: 'Fetch API calls not properly transformed',
        suggestion: 'Check API mapping configuration'
      });
    }

    // 未対応のAPIの使用をチェック
    const unsupportedApis = ['XMLHttpRequest', 'jQuery', '$'];
    unsupportedApis.forEach(api => {
      if (originalCode.includes(api)) {
        issues.push({
          type: 'warning',
          message: `Unsupported API '${api}' found in original code`,
          suggestion: `Replace '${api}' with Web standard alternatives`
        });
      }
    });

    return issues;
  }

  /**
   * ログ出力
   */
  private log(level: 'error' | 'warn' | 'info' | 'debug', message: string): void {
    const levels = ['silent', 'error', 'warn', 'info', 'debug'];
    const currentLevel = levels.indexOf(this.options.logLevel || 'info');
    const messageLevel = levels.indexOf(level);

    if (messageLevel <= currentLevel) {
      const timestamp = new Date().toISOString();
      console[level](`[${timestamp}] ktn-bridge: ${message}`);
    }
  }

  /**
   * 統計情報を取得
   */
  getStatistics(): {
    totalEventMappings: number;
    successfulEventMappings: number;
    failedEventMappings: number;
    totalApiMappings: number;
    successfulApiMappings: number;
    failedApiMappings: number;
    totalErrors: number;
    totalTransforms: number;
    recentTransforms: number;
    averageTransformSize: number;
  } {
    const allErrors = this.debugInfo.flatMap(info => info.errors);
    const allEventMappings = this.debugInfo.flatMap(info => info.eventMappings);
    const allApiMappings = this.debugInfo.flatMap(info => info.apiMappings);
    
    const now = new Date();
    const recentTraces = this.transformTraces.filter(trace => {
      const traceTime = new Date(trace.timestamp);
      return now.getTime() - traceTime.getTime() < 60 * 60 * 1000; // 1時間以内
    });

    const avgSize = this.transformTraces.reduce((sum, trace) => sum + trace.transformedCode.length, 0) / this.transformTraces.length;

    return {
      totalEventMappings: allEventMappings.length,
      successfulEventMappings: allEventMappings.filter(m => m.success).length,
      failedEventMappings: allEventMappings.filter(m => !m.success).length,
      totalApiMappings: allApiMappings.length,
      successfulApiMappings: allApiMappings.filter(m => m.success).length,
      failedApiMappings: allApiMappings.filter(m => !m.success).length,
      totalErrors: allErrors.length,
      totalTransforms: this.transformTraces.length,
      recentTransforms: recentTraces.length,
      averageTransformSize: Math.round(avgSize || 0)
    };
  }

  /**
   * デバッグ機能をクリア
   */
  clear(): void {
    this.transformTraces = [];
    this.debugInfo = [];
    this.log('info', 'Debug data cleared');
  }
}

/**
 * グローバルデバッグヘルパーインスタンス
 */
export const globalDebugHelper = new DebugHelper();

/**
 * デバッグ用のユーティリティ関数
 */
export function createDebugHelper(options?: DebugOptions): DebugHelper {
  return new DebugHelper(options);
}

export function logTransform(filename: string, originalCode: string, transformedCode: string, sourceMap?: string): void {
  globalDebugHelper.recordTransformTrace({
    originalCode,
    transformedCode,
    sourceMap,
    mappings: [],
    timestamp: new Date().toISOString(),
    filename
  });
}

export function logError(error: Error, context: { filename: string; line?: number; column?: number; code?: string }): void {
  const details = globalDebugHelper.generateErrorDetails(error, context);
  console.error(details);
}

export default DebugHelper;