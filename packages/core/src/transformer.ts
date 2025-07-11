import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { SourceMapGenerator } from 'source-map';
import type { TransformResult, TransformOptions, EventMapping } from './types';
import { getEventMapping } from './mappings/events';

export class KintoneTransformer {
  private eventMappings: Map<string, EventMapping>;
  
  constructor() {
    this.eventMappings = new Map();
    this.loadEventMappings();
  }
  
  private loadEventMappings(): void {
    const mapping = getEventMapping('app.record.index.show');
    if (mapping) {
      this.eventMappings.set('app.record.index.show', mapping);
    }
  }
  
  transform(code: string, options: TransformOptions = {}): TransformResult {
    const { sourceMap = false, filename = 'unknown.js', target = 'production' } = options;
    
    try {
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });
      
      const map = sourceMap ? new SourceMapGenerator({ file: filename }) : null;
      const dependencies: string[] = [];
      
      const transformedAst = this.transformAST(ast, map, dependencies, target);
      
      const result = generate(transformedAst, {
        sourceMaps: sourceMap,
        filename
      });
      
      return {
        code: result.code,
        map: map?.toString(),
        dependencies
      };
    } catch (error) {
      throw new Error(`Transform failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private transformAST(
    ast: t.File,
    _map: SourceMapGenerator | null,
    _dependencies: string[],
    target: 'development' | 'production'
  ): t.File {
    traverse(ast, {
      CallExpression: (path) => {
        if (this.isAddEventListener(path.node)) {
          this.transformEventListener(path, target);
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
  
  private transformEventListener(
    path: any,
    target: 'development' | 'production'
  ): void {
    const args = path.node.arguments;
    
    if (args.length >= 2 && t.isStringLiteral(args[0])) {
      const eventType = args[0].value;
      
      if (eventType === 'DOMContentLoaded') {
        this.transformDOMContentLoaded(path, target);
      }
    }
  }
  
  private transformDOMContentLoaded(
    path: any,
    target: 'development' | 'production'
  ): void {
    const args = path.node.arguments;
    const callback = args[1];
    
    if (target === 'production') {
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
      
      path.replaceWith(kintoneEventCall);
    }
  }
}