export * from './types';
export * from './transformer';
export * from './mappings';
export * from './error-handler';
export * from './type-generator';
export * from './patterns';
export * from './doc-generator';
export * from './debug-helper';
export * from './performance-optimizer';
export * from './test-generator';
export * from './snippet-generator';

// Global instances for Phase 3 features
import { DebugHelper } from './debug-helper';
import { PerformanceOptimizer } from './performance-optimizer';
import { TestGenerator } from './test-generator';
import { SnippetGenerator } from './snippet-generator';

export const globalDebugHelper = new DebugHelper();
export const globalPerformanceOptimizer = new PerformanceOptimizer();
export const globalTestGenerator = new TestGenerator();
export const globalSnippetGenerator = new SnippetGenerator();