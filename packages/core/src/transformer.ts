import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { SourceMapGenerator } from 'source-map';
import type { TransformResult, TransformOptions, EventMapping, ApiMapping } from './types';
import { getEventMapping } from './mappings/events';
import { getApiMapping } from './mappings/apis';
import { ErrorHandler, createTransformError } from './error-handler';
import { DebugHelper, type DebugInfo, type TransformTrace } from './debug-helper';

export class KintoneTransformer {
  private eventMappings: Map<string, EventMapping>;
  private apiMappings: Map<string, ApiMapping>;
  private errorHandler: ErrorHandler;
  private debugHelper: DebugHelper;
  
  constructor(options?: { enableDebug?: boolean }) {
    this.eventMappings = new Map();
    this.apiMappings = new Map();
    this.errorHandler = ErrorHandler.getInstance();
    this.debugHelper = new DebugHelper({
      enableTransformTrace: options?.enableDebug || false,
      enableErrorDetails: options?.enableDebug || false,
      logLevel: options?.enableDebug ? 'debug' : 'warn'
    });
    this.loadEventMappings();
    this.loadApiMappings();
  }
  
  private loadEventMappings(): void {
    const eventTypes = [
      'app.record.index.show',
      'app.record.detail.show',
      'app.record.create.show',
      'app.record.edit.show',
      'app.record.create.submit',
      'app.record.edit.submit',
      'app.record.edit.change',
      'app.record.edit.beforeunload',
      'app.record.custom.bulkEdit',
      'app.record.index.click'
    ];
    
    eventTypes.forEach(eventType => {
      const mapping = getEventMapping(eventType);
      if (mapping) {
        this.eventMappings.set(eventType, mapping);
      }
    });
  }
  
  private loadApiMappings(): void {
    const apiTypes = [
      'records.get',
      'record.get',
      'record.post',
      'record.put',
      'record.delete'
    ];
    
    apiTypes.forEach(apiType => {
      const mapping = getApiMapping(apiType);
      if (mapping) {
        this.apiMappings.set(apiType, mapping);
      }
    });
  }
  
  transform(code: string, options: TransformOptions = {}): TransformResult {
    const { sourceMap = false, filename = 'unknown.js', target = 'production' } = options;
    
    try {
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });
      
      const map = sourceMap ? new SourceMapGenerator({ 
        file: filename,
        sourceRoot: '.'
      }) : null;
      
      const dependencies: string[] = [];
      const debugInfo: DebugInfo = {
        eventMappings: [],
        apiMappings: [],
        errors: []
      };
      
      const transformedAst = this.transformAST(ast, map, dependencies, target, debugInfo);
      
      const result = generate(transformedAst, {
        sourceMaps: sourceMap,
        filename
      });
      
      // ソースマップに元のソースコードを追加
      if (map) {
        map.setSourceContent(filename, code);
      }
      
      // デバッグ情報を記録
      this.debugHelper.recordDebugInfo(debugInfo);
      
      // 変換トレースを記録
      const transformTrace: TransformTrace = {
        originalCode: code,
        transformedCode: result.code,
        sourceMap: map?.toString(),
        mappings: [],
        timestamp: new Date().toISOString(),
        filename
      };
      this.debugHelper.recordTransformTrace(transformTrace);
      
      // 変換の妥当性をチェック
      const validationIssues = this.debugHelper.validateTransform(code, result.code);
      validationIssues.forEach(issue => {
        debugInfo.errors.push({
          message: issue.message,
          location: { line: 0, column: 0 },
          severity: issue.type,
          code: 'validation',
          suggestions: issue.suggestion ? [issue.suggestion] : []
        });
      });
      
      return {
        code: result.code,
        map: map?.toString(),
        dependencies
      };
    } catch (error) {
      const transformError = createTransformError(
        `Transform failed: ${error instanceof Error ? error.message : String(error)}`,
        filename,
        code,
        undefined, // transformed code is not available in case of error
        this.getErrorLine(error),
        this.getErrorColumn(error)
      );
      
      this.errorHandler.handleError(transformError);
      throw transformError;
    }
  }
  
  private getErrorLine(error: any): number | undefined {
    if (error && typeof error.loc === 'object' && typeof error.loc.line === 'number') {
      return error.loc.line;
    }
    return undefined;
  }
  
  private getErrorColumn(error: any): number | undefined {
    if (error && typeof error.loc === 'object' && typeof error.loc.column === 'number') {
      return error.loc.column;
    }
    return undefined;
  }
  
  private transformAST(
    ast: t.File,
    map: SourceMapGenerator | null,
    _dependencies: string[],
    target: 'development' | 'production',
    debugInfo?: DebugInfo
  ): t.File {
    traverse(ast, {
      CallExpression: (path) => {
        if (this.isAddEventListener(path.node)) {
          this.transformEventListener(path, target, map, debugInfo);
        } else if (this.isFetchCall(path.node)) {
          this.transformFetchCall(path, target, map);
        }
      }
    });
    
    return ast;
  }
  
  private isAddEventListener(node: t.CallExpression): boolean {
    return (
      t.isMemberExpression(node.callee) &&
      t.isIdentifier(node.callee.object, { name: 'document' }) &&
      t.isIdentifier(node.callee.property, { name: 'addEventListener' })
    );
  }
  
  private isFetchCall(node: t.CallExpression): boolean {
    return (
      t.isIdentifier(node.callee, { name: 'fetch' })
    );
  }
  
  private transformEventListener(
    path: any,
    target: 'development' | 'production',
    map: SourceMapGenerator | null,
    debugInfo?: DebugInfo
  ): void {
    const args = path.node.arguments;
    
    if (args.length >= 2 && t.isStringLiteral(args[0])) {
      const eventType = args[0].value;
      const location = { line: path.node.loc?.start.line || 0, column: path.node.loc?.start.column || 0 };
      
      try {
        if (eventType === 'DOMContentLoaded') {
          this.transformDOMContentLoaded(path, target, map);
          debugInfo?.eventMappings.push({
            webEvent: 'DOMContentLoaded',
            kintoneEvent: 'app.record.index.show',
            location,
            success: true
          });
        } else if (eventType === 'submit') {
          this.transformSubmitEvent(path, target, map);
          debugInfo?.eventMappings.push({
            webEvent: 'submit',
            kintoneEvent: 'app.record.edit.submit',
            location,
            success: true
          });
        } else {
          debugInfo?.eventMappings.push({
            webEvent: eventType,
            kintoneEvent: 'unknown',
            location,
            success: false,
            error: `Unsupported event type: ${eventType}`
          });
        }
      } catch (error) {
        debugInfo?.eventMappings.push({
          webEvent: eventType,
          kintoneEvent: 'unknown',
          location,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }
  
  private transformDOMContentLoaded(
    path: any,
    target: 'development' | 'production',
    map: SourceMapGenerator | null
  ): void {
    const args = path.node.arguments;
    const callback = args[1];
    
    if (target === 'production') {
      const originalLoc = path.node.loc;
      
      const kintoneEventCall = t.callExpression(
        t.memberExpression(
          t.memberExpression(t.identifier('kintone'), t.identifier('events')),
          t.identifier('on')
        ),
        [
          t.stringLiteral('app.record.index.show'),
          t.arrowFunctionExpression(
            [t.identifier('event')],
            t.blockStatement([
              t.expressionStatement(
                t.callExpression(callback, [t.identifier('event')])
              ),
              t.returnStatement(t.identifier('event'))
            ])
          )
        ]
      );
      
      // ソースマップに詳細なマッピング情報を追加
      if (map && originalLoc) {
        map.addMapping({
          generated: { line: originalLoc.start.line, column: originalLoc.start.column },
          original: { line: originalLoc.start.line, column: originalLoc.start.column },
          source: 'transformed',
          name: 'DOMContentLoaded->app.record.index.show'
        });
      }
      
      path.replaceWith(kintoneEventCall);
    }
  }
  
  private transformSubmitEvent(
    path: any,
    target: 'development' | 'production',
    map: SourceMapGenerator | null
  ): void {
    const args = path.node.arguments;
    const callback = args[1];
    
    if (target === 'production') {
      const originalLoc = path.node.loc;
      
      const kintoneEventCall = t.callExpression(
        t.memberExpression(
          t.memberExpression(t.identifier('kintone'), t.identifier('events')),
          t.identifier('on')
        ),
        [
          t.stringLiteral('app.record.create.submit'),
          t.arrowFunctionExpression(
            [t.identifier('event')],
            t.blockStatement([
              t.expressionStatement(
                t.callExpression(callback, [t.identifier('event')])
              ),
              t.returnStatement(t.identifier('event'))
            ])
          )
        ]
      );
      
      // ソースマップに詳細なマッピング情報を追加
      if (map && originalLoc) {
        map.addMapping({
          generated: { line: originalLoc.start.line, column: originalLoc.start.column },
          original: { line: originalLoc.start.line, column: originalLoc.start.column },
          source: 'transformed',
          name: 'submit->app.record.create.submit'
        });
      }
      
      path.replaceWith(kintoneEventCall);
    }
  }
  
  private transformFetchCall(
    path: any,
    target: 'development' | 'production',
    map: SourceMapGenerator | null
  ): void {
    const args = path.node.arguments;
    
    if (args.length >= 1 && t.isStringLiteral(args[0]) && target === 'production') {
      const url = args[0].value;
      const originalLoc = path.node.loc;
      
      // /api/records パターンの変換
      if (url.includes('/api/records')) {
        const kintoneApiCall = t.callExpression(
          t.memberExpression(t.identifier('kintone'), t.identifier('api')),
          [
            t.stringLiteral('/k/v1/records'),
            t.stringLiteral('GET'),
            t.objectExpression([
              t.objectProperty(t.identifier('app'), t.numericLiteral(1))
            ])
          ]
        );
        
        // ソースマップに詳細なマッピング情報を追加
        if (map && originalLoc) {
          map.addMapping({
            generated: { line: originalLoc.start.line, column: originalLoc.start.column },
            original: { line: originalLoc.start.line, column: originalLoc.start.column },
            source: 'transformed',
            name: `fetch(${url})->kintone.api(/k/v1/records)`
          });
        }
        
        path.replaceWith(kintoneApiCall);
      }
      // /api/record パターンの変換
      else if (url.includes('/api/record')) {
        const kintoneApiCall = t.callExpression(
          t.memberExpression(t.identifier('kintone'), t.identifier('api')),
          [
            t.stringLiteral('/k/v1/record'),
            t.stringLiteral('GET'),
            t.objectExpression([
              t.objectProperty(t.identifier('app'), t.numericLiteral(1)),
              t.objectProperty(t.identifier('id'), t.numericLiteral(123))
            ])
          ]
        );
        
        // ソースマップに詳細なマッピング情報を追加
        if (map && originalLoc) {
          map.addMapping({
            generated: { line: originalLoc.start.line, column: originalLoc.start.column },
            original: { line: originalLoc.start.line, column: originalLoc.start.column },
            source: 'transformed',
            name: `fetch(${url})->kintone.api(/k/v1/record)`
          });
        }
        
        path.replaceWith(kintoneApiCall);
      }
    }
  }
}