import { describe, it, expect, beforeEach } from 'vitest';
import { DebugHelper } from './debug-helper';
import type { DebugInfo, TransformTrace } from './types';

describe('DebugHelper', () => {
  let debugHelper: DebugHelper;

  beforeEach(() => {
    debugHelper = new DebugHelper();
  });

  describe('recordDebugInfo', () => {
    it('should record debug info with default options', () => {
      const debugInfo: DebugInfo = {
        eventMappings: [{
          webEvent: 'DOMContentLoaded',
          kintoneEvent: 'app.record.index.show',
          location: { line: 1, column: 1 },
          success: true
        }],
        apiMappings: [],
        errors: []
      };

      debugHelper.recordDebugInfo(debugInfo);
      const stats = debugHelper.getStatistics();
      
      expect(stats.totalEventMappings).toBe(1);
      expect(stats.totalApiMappings).toBe(0);
      expect(stats.totalErrors).toBe(0);
    });

    it('should record multiple debug info entries', () => {
      const debugInfo1: DebugInfo = {
        eventMappings: [{
          webEvent: 'click',
          kintoneEvent: 'app.record.detail.show',
          location: { line: 1, column: 1 },
          success: true
        }],
        apiMappings: [],
        errors: []
      };

      const debugInfo2: DebugInfo = {
        eventMappings: [],
        apiMappings: [{
          webUrl: '/api/records',
          kintoneApi: 'kintone.api',
          method: 'GET',
          success: true
        }],
        errors: []
      };

      debugHelper.recordDebugInfo(debugInfo1);
      debugHelper.recordDebugInfo(debugInfo2);
      
      const stats = debugHelper.getStatistics();
      expect(stats.totalEventMappings).toBe(1);
      expect(stats.totalApiMappings).toBe(1);
      expect(stats.totalErrors).toBe(0);
    });

    it('should record errors', () => {
      const debugInfo: DebugInfo = {
        eventMappings: [],
        apiMappings: [],
        errors: [{
          message: 'Test error',
          location: { line: 1, column: 1 },
          suggestion: 'Fix the test'
        }]
      };

      debugHelper.recordDebugInfo(debugInfo);
      const stats = debugHelper.getStatistics();
      
      expect(stats.totalErrors).toBe(1);
    });
  });

  describe('recordTransformTrace', () => {
    it('should record transform trace when enabled', () => {
      const debugHelperWithTrace = new DebugHelper({
        enableTransformTrace: true
      });

      const trace: TransformTrace = {
        filename: 'test.ts',
        originalCode: 'console.log("test")',
        transformedCode: 'console.log("test")',
        transformDuration: 10,
        transformedAt: new Date().toISOString()
      };

      debugHelperWithTrace.recordTransformTrace(trace);
      
      const report = debugHelperWithTrace.generateTransformReport('test.ts');
      expect(report).toContain('test.ts');
      expect(report).toContain('10ms');
    });

    it('should not record transform trace when disabled', () => {
      const debugHelperWithoutTrace = new DebugHelper({
        enableTransformTrace: false
      });

      const trace: TransformTrace = {
        filename: 'test.ts',
        originalCode: 'console.log("test")',
        transformedCode: 'console.log("test")',
        transformDuration: 10,
        transformedAt: new Date().toISOString()
      };

      debugHelperWithoutTrace.recordTransformTrace(trace);
      
      const report = debugHelperWithoutTrace.generateTransformReport('test.ts');
      expect(report).toContain('Transform trace not enabled');
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', () => {
      const debugInfo: DebugInfo = {
        eventMappings: [
          {
            webEvent: 'DOMContentLoaded',
            kintoneEvent: 'app.record.index.show',
            location: { line: 1, column: 1 },
            success: true
          },
          {
            webEvent: 'click',
            kintoneEvent: 'app.record.detail.show',
            location: { line: 2, column: 1 },
            success: false
          }
        ],
        apiMappings: [{
          webUrl: '/api/records',
          kintoneApi: 'kintone.api',
          method: 'GET',
          success: true
        }],
        errors: [{
          message: 'Test error',
          location: { line: 3, column: 1 },
          suggestion: 'Fix the test'
        }]
      };

      debugHelper.recordDebugInfo(debugInfo);
      const stats = debugHelper.getStatistics();
      
      expect(stats.totalEventMappings).toBe(2);
      expect(stats.successfulEventMappings).toBe(1);
      expect(stats.failedEventMappings).toBe(1);
      expect(stats.totalApiMappings).toBe(1);
      expect(stats.successfulApiMappings).toBe(1);
      expect(stats.failedApiMappings).toBe(0);
      expect(stats.totalErrors).toBe(1);
    });
  });

  describe('generateDiagnosticReport', () => {
    it('should generate diagnostic report', () => {
      const debugInfo: DebugInfo = {
        eventMappings: [{
          webEvent: 'DOMContentLoaded',
          kintoneEvent: 'app.record.index.show',
          location: { line: 1, column: 1 },
          success: true
        }],
        apiMappings: [{
          webUrl: '/api/records',
          kintoneApi: 'kintone.api',
          method: 'GET',
          success: true
        }],
        errors: [{
          message: 'Test error',
          location: { line: 1, column: 1 },
          suggestion: 'Fix the test'
        }]
      };

      debugHelper.recordDebugInfo(debugInfo);
      const report = debugHelper.generateDiagnosticReport();
      
      expect(report).toContain('Diagnostic Report');
      expect(report).toContain('Event Mappings: 1');
      expect(report).toContain('API Mappings: 1');
      expect(report).toContain('Errors: 1');
      expect(report).toContain('DOMContentLoaded');
      expect(report).toContain('/api/records');
      expect(report).toContain('Test error');
    });
  });

  describe('generateTransformReport', () => {
    it('should generate transform report for existing file', () => {
      const debugHelperWithTrace = new DebugHelper({
        enableTransformTrace: true
      });

      const trace: TransformTrace = {
        filename: 'test.ts',
        originalCode: 'document.addEventListener("DOMContentLoaded", () => {})',
        transformedCode: 'kintone.events.on("app.record.index.show", () => {})',
        transformDuration: 15,
        transformedAt: new Date().toISOString()
      };

      debugHelperWithTrace.recordTransformTrace(trace);
      const report = debugHelperWithTrace.generateTransformReport('test.ts');
      
      expect(report).toContain('Transform Report: test.ts');
      expect(report).toContain('15ms');
      expect(report).toContain('document.addEventListener');
      expect(report).toContain('kintone.events.on');
    });

    it('should handle non-existent file', () => {
      const report = debugHelper.generateTransformReport('nonexistent.ts');
      expect(report).toContain('No transform trace found for nonexistent.ts');
    });
  });
});