/**
 * ktn-bridge パフォーマンス最適化機能
 * 変換処理の最適化とパフォーマンス監視を行う
 */

export interface PerformanceMetrics {
  transformTime: number;
  codeSize: {
    original: number;
    transformed: number;
    compression: number;
  };
  memoryUsage: {
    before: number;
    after: number;
    peak: number;
  };
  cacheHitRate: number;
  timestamp: string;
}

export interface OptimizationOptions {
  enableCodeMinification?: boolean;
  enableTreeShaking?: boolean;
  enableInlining?: boolean;
  enableCaching?: boolean;
  cacheSize?: number;
  targetSize?: number;
}

export class PerformanceOptimizer {
  private metrics: PerformanceMetrics[] = [];
  private cache: Map<string, { result: any; timestamp: number }> = new Map();
  private options: OptimizationOptions;

  constructor(options: OptimizationOptions = {}) {
    this.options = {
      enableCodeMinification: true,
      enableTreeShaking: true,
      enableInlining: true,
      enableCaching: true,
      cacheSize: 1000,
      targetSize: 50000, // 50KB
      ...options
    };
  }

  /**
   * 変換処理を最適化して実行
   */
  async optimizeTransform<T>(
    key: string,
    transform: () => Promise<T> | T,
    options: { 
      skipCache?: boolean; 
      cacheTimeout?: number; 
      enableMetrics?: boolean 
    } = {}
  ): Promise<T> {
    const startTime = performance.now();
    const beforeMemory = this.getMemoryUsage();

    // キャッシュチェック
    if (this.options.enableCaching && !options.skipCache) {
      const cached = this.getCachedResult<T>(key, options.cacheTimeout);
      if (cached) {
        return cached;
      }
    }

    // 変換実行
    const result = await transform();

    // キャッシュに保存
    if (this.options.enableCaching && !options.skipCache) {
      this.setCachedResult(key, result);
    }

    // パフォーマンス測定
    if (options.enableMetrics !== false) {
      const endTime = performance.now();
      const afterMemory = this.getMemoryUsage();
      
      this.recordMetrics({
        transformTime: endTime - startTime,
        codeSize: this.calculateCodeSize(result),
        memoryUsage: {
          before: beforeMemory,
          after: afterMemory,
          peak: Math.max(beforeMemory, afterMemory)
        },
        cacheHitRate: this.calculateCacheHitRate(),
        timestamp: new Date().toISOString()
      });
    }

    return result;
  }

  /**
   * コードの最適化を実行
   */
  optimizeCode(code: string, options: {
    minify?: boolean;
    removeComments?: boolean;
    removeWhitespace?: boolean;
    inlineSmallFunctions?: boolean;
  } = {}): string {
    let optimizedCode = code;

    // コメント削除
    if (options.removeComments) {
      optimizedCode = this.removeComments(optimizedCode);
    }

    // 空白文字削除
    if (options.removeWhitespace) {
      optimizedCode = this.removeUnnecessaryWhitespace(optimizedCode);
    }

    // 小さい関数のインライン化
    if (options.inlineSmallFunctions && this.options.enableInlining) {
      optimizedCode = this.inlineSmallFunctions(optimizedCode);
    }

    // ミニファイ
    if (options.minify && this.options.enableCodeMinification) {
      optimizedCode = this.minifyCode(optimizedCode);
    }

    return optimizedCode;
  }

  /**
   * 変換結果の品質を評価
   */
  evaluateQuality(originalCode: string, transformedCode: string): {
    score: number;
    issues: Array<{
      type: 'performance' | 'size' | 'compatibility';
      message: string;
      severity: 'low' | 'medium' | 'high';
      suggestion: string;
    }>;
  } {
    const issues: Array<{
      type: 'performance' | 'size' | 'compatibility';
      message: string;
      severity: 'low' | 'medium' | 'high';
      suggestion: string;
    }> = [];

    let score = 100;

    // サイズ評価
    const sizeRatio = transformedCode.length / originalCode.length;
    if (sizeRatio > 2) {
      score -= 20;
      issues.push({
        type: 'size',
        message: `Transformed code is ${(sizeRatio * 100).toFixed(1)}% larger than original`,
        severity: 'high',
        suggestion: 'Consider enabling code minification or tree shaking'
      });
    }

    // パフォーマンス評価
    const complexityScore = this.calculateComplexity(transformedCode);
    if (complexityScore > 10) {
      score -= 15;
      issues.push({
        type: 'performance',
        message: `High code complexity detected (score: ${complexityScore})`,
        severity: 'medium',
        suggestion: 'Consider refactoring complex functions'
      });
    }

    // 互換性評価
    const compatibilityIssues = this.checkCompatibility(transformedCode);
    if (compatibilityIssues.length > 0) {
      score -= compatibilityIssues.length * 5;
      compatibilityIssues.forEach(issue => {
        issues.push({
          type: 'compatibility',
          message: issue,
          severity: 'medium',
          suggestion: 'Check kintone API compatibility'
        });
      });
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }

  /**
   * パフォーマンスレポートを生成
   */
  generatePerformanceReport(): string {
    const recentMetrics = this.metrics.slice(-10);
    const avgTransformTime = recentMetrics.reduce((sum, m) => sum + m.transformTime, 0) / recentMetrics.length;
    const avgCodeSize = recentMetrics.reduce((sum, m) => sum + m.codeSize.transformed, 0) / recentMetrics.length;
    const avgCacheHitRate = recentMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / recentMetrics.length;

    const report = [
      `=== Performance Report ===`,
      `Metrics collected: ${this.metrics.length}`,
      `Average transform time: ${avgTransformTime.toFixed(2)}ms`,
      `Average code size: ${Math.round(avgCodeSize)} bytes`,
      `Average cache hit rate: ${(avgCacheHitRate * 100).toFixed(1)}%`,
      ``,
      `Recent transforms:`,
      ...recentMetrics.map(m => 
        `  ${m.timestamp}: ${m.transformTime.toFixed(2)}ms, ${m.codeSize.transformed} bytes`
      ),
      ``,
      `Optimization recommendations:`,
      ...this.generateOptimizationRecommendations()
    ];

    return report.join('\n');
  }

  /**
   * 最適化の推奨事項を生成
   */
  generateOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const recentMetrics = this.metrics.slice(-10);

    // 変換時間が長い場合
    const avgTransformTime = recentMetrics.reduce((sum, m) => sum + m.transformTime, 0) / recentMetrics.length;
    if (avgTransformTime > 100) {
      recommendations.push('- Consider enabling caching to reduce transform time');
    }

    // コードサイズが大きい場合
    const avgCodeSize = recentMetrics.reduce((sum, m) => sum + m.codeSize.transformed, 0) / recentMetrics.length;
    if (avgCodeSize > this.options.targetSize!) {
      recommendations.push('- Enable code minification to reduce bundle size');
      recommendations.push('- Consider tree shaking to remove unused code');
    }

    // キャッシュヒット率が低い場合
    const avgCacheHitRate = recentMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / recentMetrics.length;
    if (avgCacheHitRate < 0.5) {
      recommendations.push('- Increase cache size to improve hit rate');
    }

    // メモリ使用量が多い場合
    const maxMemoryUsage = Math.max(...recentMetrics.map(m => m.memoryUsage.peak));
    if (maxMemoryUsage > 100 * 1024 * 1024) { // 100MB
      recommendations.push('- Consider processing files in batches to reduce memory usage');
    }

    return recommendations.length > 0 ? recommendations : ['- No optimization recommendations at this time'];
  }

  /**
   * キャッシュを最適化
   */
  optimizeCache(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1時間

    // 古いキャッシュエントリを削除
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }

    // キャッシュサイズ制限
    if (this.cache.size > this.options.cacheSize!) {
      const entries = Array.from(this.cache.entries());
      const sortedEntries = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      
      // 古いエントリを削除
      const toDelete = sortedEntries.slice(this.options.cacheSize!);
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }

  private getCachedResult<T>(key: string, timeout: number = 300000): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < timeout) {
      return cached.result;
    }
    return null;
  }

  private setCachedResult<T>(key: string, result: T): void {
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // 最新の1000件のみ保持
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
  }

  private calculateCodeSize(result: any): { original: number; transformed: number; compression: number } {
    const transformed = typeof result === 'string' ? result.length : JSON.stringify(result).length;
    const original = 0; // 元のコードサイズは外部から提供される必要がある
    
    return {
      original,
      transformed,
      compression: original > 0 ? (transformed / original) : 1
    };
  }

  private calculateCacheHitRate(): number {
    // 簡易的な実装（実際にはより詳細な追跡が必要）
    return this.cache.size > 0 ? Math.min(1, this.cache.size / 100) : 0;
  }

  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private removeComments(code: string): string {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // ブロックコメント
      .replace(/\/\/.*$/gm, ''); // 行コメント
  }

  private removeUnnecessaryWhitespace(code: string): string {
    return code
      .replace(/\s+/g, ' ') // 複数の空白文字を1つに
      .replace(/\s*([{}();,])\s*/g, '$1') // 区切り文字周りの空白を削除
      .trim();
  }

  private inlineSmallFunctions(code: string): string {
    // 簡易的な実装（実際にはASTを使用した方が良い）
    return code.replace(/function\s+(\w+)\s*\(\s*\)\s*{\s*return\s+([^}]+);\s*}/g, 
      (match, name, body) => {
        if (body.length < 50) {
          return `const ${name} = () => ${body};`;
        }
        return match;
      });
  }

  private minifyCode(code: string): string {
    // 簡易的なミニファイ（実際にはterserなどを使用）
    return this.removeComments(this.removeUnnecessaryWhitespace(code));
  }

  private calculateComplexity(code: string): number {
    // サイクロマティック複雑度の簡易計算
    const patterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\btry\b/g,
      /\bcatch\b/g,
      /\?\s*:/g // 三項演算子
    ];

    let complexity = 1; // 基本複雑度
    patterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  private checkCompatibility(code: string): string[] {
    const issues: string[] = [];
    
    // 非対応APIの使用をチェック
    const unsupportedApis = [
      'XMLHttpRequest',
      'jQuery',
      'angular',
      'react',
      'vue'
    ];

    unsupportedApis.forEach(api => {
      if (code.includes(api)) {
        issues.push(`Unsupported API '${api}' detected`);
      }
    });

    // ES6+の機能で古いブラウザで動作しないものをチェック
    if (code.includes('async ') || code.includes('await ')) {
      issues.push('async/await may not be supported in older browsers');
    }

    return issues;
  }

  /**
   * 統計情報を取得
   */
  getStatistics(): {
    totalTransforms: number;
    averageTransformTime: number;
    cacheHitRate: number;
    memoryUsage: number;
  } {
    const recentMetrics = this.metrics.slice(-100);
    const avgTransformTime = recentMetrics.reduce((sum, m) => sum + m.transformTime, 0) / recentMetrics.length;
    const avgCacheHitRate = recentMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / recentMetrics.length;
    const avgMemoryUsage = recentMetrics.reduce((sum, m) => sum + m.memoryUsage.peak, 0) / recentMetrics.length;

    return {
      totalTransforms: this.metrics.length,
      averageTransformTime: avgTransformTime || 0,
      cacheHitRate: avgCacheHitRate || 0,
      memoryUsage: avgMemoryUsage || 0
    };
  }

  /**
   * 最適化設定を更新
   */
  updateOptions(newOptions: Partial<OptimizationOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * メトリクスをクリア
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const globalPerformanceOptimizer = new PerformanceOptimizer();

export default PerformanceOptimizer;