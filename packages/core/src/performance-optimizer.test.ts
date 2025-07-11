import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceOptimizer } from './performance-optimizer';

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer;

  beforeEach(() => {
    optimizer = new PerformanceOptimizer();
  });

  describe('optimizeTransform', () => {
    it('should cache and return result for same key', async () => {
      const mockTransform = vi.fn().mockResolvedValue('transformed result');
      
      const result1 = await optimizer.optimizeTransform('test-key', mockTransform);
      const result2 = await optimizer.optimizeTransform('test-key', mockTransform);
      
      expect(result1).toBe('transformed result');
      expect(result2).toBe('transformed result');
      expect(mockTransform).toHaveBeenCalledTimes(1); // Should be called only once due to caching
    });

    it('should skip cache when option is set', async () => {
      const mockTransform = vi.fn().mockResolvedValue('transformed result');
      
      const result1 = await optimizer.optimizeTransform('test-key', mockTransform);
      const result2 = await optimizer.optimizeTransform('test-key', mockTransform, { skipCache: true });
      
      expect(result1).toBe('transformed result');
      expect(result2).toBe('transformed result');
      expect(mockTransform).toHaveBeenCalledTimes(2); // Should be called twice due to skipCache
    });

    it('should handle errors gracefully', async () => {
      const mockTransform = vi.fn().mockRejectedValue(new Error('Transform failed'));
      
      await expect(optimizer.optimizeTransform('test-key', mockTransform))
        .rejects.toThrow('Transform failed');
    });

    it('should respect cache timeout', async () => {
      const mockTransform = vi.fn().mockResolvedValue('transformed result');
      
      await optimizer.optimizeTransform('test-key', mockTransform, { cacheTimeout: 100 });
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      await optimizer.optimizeTransform('test-key', mockTransform);
      
      expect(mockTransform).toHaveBeenCalledTimes(2); // Should be called twice due to cache expiration
    });
  });

  describe('optimizeCode', () => {
    it('should minify JavaScript code', () => {
      const code = `
        // This is a comment
        const message = "Hello World";
        console.log(message);
      `;
      
      const optimized = optimizer.optimizeCode(code);
      
      expect(optimized).not.toContain('// This is a comment');
      expect(optimized.length).toBeLessThan(code.length);
    });

    it('should handle empty code', () => {
      const optimized = optimizer.optimizeCode('');
      expect(optimized).toBe('');
    });

    it('should handle invalid JavaScript gracefully', () => {
      const invalidCode = 'const = invalid syntax';
      const optimized = optimizer.optimizeCode(invalidCode);
      expect(optimized).toBe(invalidCode); // Should return original code if optimization fails
    });
  });

  describe('evaluateCodeQuality', () => {
    it('should evaluate code quality metrics', () => {
      const code = `
        function complexFunction(a, b, c) {
          if (a > 0) {
            if (b > 0) {
              if (c > 0) {
                return a + b + c;
              } else {
                return a + b;
              }
            } else {
              return a;
            }
          } else {
            return 0;
          }
        }
      `;
      
      const quality = optimizer.evaluateCodeQuality(code);
      
      expect(quality.cyclomaticComplexity).toBeGreaterThan(1);
      expect(quality.linesOfCode).toBeGreaterThan(10);
      expect(quality.suggestions).toContain('High cyclomatic complexity');
    });

    it('should handle simple code', () => {
      const code = 'const x = 1;';
      const quality = optimizer.evaluateCodeQuality(code);
      
      expect(quality.cyclomaticComplexity).toBe(1);
      expect(quality.linesOfCode).toBe(1);
      expect(quality.suggestions).toHaveLength(0);
    });
  });

  describe('getStatistics', () => {
    it('should return performance statistics', async () => {
      const mockTransform = vi.fn().mockResolvedValue('result');
      
      await optimizer.optimizeTransform('test-key1', mockTransform);
      await optimizer.optimizeTransform('test-key2', mockTransform);
      
      const stats = optimizer.getStatistics();
      
      expect(stats.totalTransforms).toBe(2);
      expect(stats.cacheHits).toBe(0);
      expect(stats.averageTransformTime).toBeGreaterThan(0);
    });

    it('should track cache hits', async () => {
      const mockTransform = vi.fn().mockResolvedValue('result');
      
      await optimizer.optimizeTransform('test-key', mockTransform);
      await optimizer.optimizeTransform('test-key', mockTransform); // Cache hit
      
      const stats = optimizer.getStatistics();
      
      expect(stats.totalTransforms).toBe(2);
      expect(stats.cacheHits).toBe(1);
    });
  });

  describe('generatePerformanceReport', () => {
    it('should generate performance report', async () => {
      const mockTransform = vi.fn().mockResolvedValue('result');
      
      await optimizer.optimizeTransform('test-key', mockTransform);
      
      const report = optimizer.generatePerformanceReport();
      
      expect(report).toContain('Performance Report');
      expect(report).toContain('Total Transforms: 1');
      expect(report).toContain('Cache Hits: 0');
      expect(report).toContain('Average Transform Time:');
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      const mockTransform = vi.fn().mockResolvedValue('result');
      
      await optimizer.optimizeTransform('test-key', mockTransform);
      optimizer.clearCache();
      await optimizer.optimizeTransform('test-key', mockTransform);
      
      expect(mockTransform).toHaveBeenCalledTimes(2); // Should be called twice after cache clear
    });
  });

  describe('memory management', () => {
    it('should handle memory pressure', () => {
      // Mock memory usage
      const originalMemory = (global as any).performance?.memory;
      (global as any).performance = {
        memory: {
          usedJSHeapSize: 100 * 1024 * 1024, // 100MB
          totalJSHeapSize: 200 * 1024 * 1024, // 200MB
          jsHeapSizeLimit: 500 * 1024 * 1024  // 500MB
        }
      };

      const stats = optimizer.getStatistics();
      
      expect(stats.memoryUsage).toBeDefined();
      expect(stats.memoryUsage.used).toBe(100);
      expect(stats.memoryUsage.total).toBe(200);
      expect(stats.memoryUsage.limit).toBe(500);

      // Restore original memory
      if (originalMemory) {
        (global as any).performance.memory = originalMemory;
      } else {
        delete (global as any).performance?.memory;
      }
    });
  });
});