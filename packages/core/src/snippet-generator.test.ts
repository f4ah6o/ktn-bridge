import { describe, it, expect, beforeEach } from 'vitest';
import { SnippetGenerator } from './snippet-generator';

describe('SnippetGenerator', () => {
  let generator: SnippetGenerator;

  beforeEach(() => {
    generator = new SnippetGenerator();
  });

  describe('getSnippets', () => {
    it('should return list of available snippets', () => {
      const snippets = generator.getSnippets();
      
      expect(snippets).toBeInstanceOf(Array);
      expect(snippets.length).toBeGreaterThan(0);
      expect(snippets.some(s => s.name === 'Record List Event Handler')).toBe(true);
      expect(snippets.some(s => s.name === 'Record Detail Event Handler')).toBe(true);
      expect(snippets.some(s => s.name === 'API Call with Error Handling')).toBe(true);
    });

    it('should include snippet metadata', () => {
      const snippets = generator.getSnippets();
      const snippet = snippets[0];
      
      expect(snippet).toHaveProperty('name');
      expect(snippet).toHaveProperty('description');
      expect(snippet).toHaveProperty('category');
      expect(snippet).toHaveProperty('language');
      expect(snippet).toHaveProperty('template');
      expect(snippet).toHaveProperty('parameters');
    });
  });

  describe('generateSnippet', () => {
    it('should generate Record List Event Handler snippet', () => {
      const snippet = generator.generateSnippet('Record List Event Handler', {
        pageType: 'record-list'
      });
      
      expect(snippet).toContain('document.addEventListener');
      expect(snippet).toContain('DOMContentLoaded');
      expect(snippet).toContain('data-page');
      expect(snippet).toContain('record-list');
    });

    it('should generate Record Detail Event Handler snippet', () => {
      const snippet = generator.generateSnippet('Record Detail Event Handler', {
        pageType: 'record-detail',
        eventType: 'change'
      });
      
      expect(snippet).toContain('document.addEventListener');
      expect(snippet).toContain('change');
      expect(snippet).toContain('record-detail');
    });

    it('should generate API Call snippet with error handling', () => {
      const snippet = generator.generateSnippet('API Call with Error Handling', {
        endpoint: '/api/records',
        method: 'GET',
        appId: '1'
      });
      
      expect(snippet).toContain('fetch');
      expect(snippet).toContain('/api/records');
      expect(snippet).toContain('GET');
      expect(snippet).toContain('try');
      expect(snippet).toContain('catch');
      expect(snippet).toContain('app=1');
    });

    it('should generate Form Handler snippet', () => {
      const snippet = generator.generateSnippet('Form Handler', {
        formType: 'record-edit',
        validationRules: ['required', 'maxLength']
      });
      
      expect(snippet).toContain('addEventListener');
      expect(snippet).toContain('submit');
      expect(snippet).toContain('FormData');
      expect(snippet).toContain('record-edit');
      expect(snippet).toContain('required');
      expect(snippet).toContain('maxLength');
    });

    it('should generate Auto-save snippet', () => {
      const snippet = generator.generateSnippet('Auto-save', {
        fieldName: 'title',
        delay: 500
      });
      
      expect(snippet).toContain('change');
      expect(snippet).toContain('title');
      expect(snippet).toContain('setTimeout');
      expect(snippet).toContain('500');
      expect(snippet).toContain('fetch');
    });

    it('should generate Bulk Operations snippet', () => {
      const snippet = generator.generateSnippet('Bulk Operations', {
        operationType: 'update',
        batchSize: 10
      });
      
      expect(snippet).toContain('bulk');
      expect(snippet).toContain('update');
      expect(snippet).toContain('Promise.all');
      expect(snippet).toContain('10');
    });

    it('should handle unknown snippet name', () => {
      const snippet = generator.generateSnippet('Unknown Snippet', {});
      expect(snippet).toBe('');
    });

    it('should use default values when parameters are missing', () => {
      const snippet = generator.generateSnippet('Record List Event Handler', {});
      
      expect(snippet).toContain('record-list'); // Default pageType
      expect(snippet).toBeDefined();
      expect(snippet.length).toBeGreaterThan(0);
    });
  });

  describe('generateUsageStats', () => {
    it('should generate usage statistics', () => {
      // Generate some snippets to create usage stats
      generator.generateSnippet('Record List Event Handler', {});
      generator.generateSnippet('API Call with Error Handling', {});
      generator.generateSnippet('Record List Event Handler', {}); // Duplicate
      
      const stats = generator.generateUsageStats();
      
      expect(stats).toHaveProperty('totalSnippets');
      expect(stats).toHaveProperty('totalUsage');
      expect(stats).toHaveProperty('mostUsed');
      expect(stats).toHaveProperty('categoryStats');
      
      expect(stats.totalUsage).toBe(3);
      expect(stats.mostUsed).toBe('Record List Event Handler');
    });

    it('should handle no usage stats', () => {
      const stats = generator.generateUsageStats();
      
      expect(stats.totalUsage).toBe(0);
      expect(stats.mostUsed).toBe('');
    });
  });

  describe('getSnippetsByCategory', () => {
    it('should return snippets filtered by category', () => {
      const eventSnippets = generator.getSnippetsByCategory('Events');
      
      expect(eventSnippets).toBeInstanceOf(Array);
      expect(eventSnippets.every(s => s.category === 'Events')).toBe(true);
      expect(eventSnippets.some(s => s.name.includes('Event Handler'))).toBe(true);
    });

    it('should return empty array for unknown category', () => {
      const unknownSnippets = generator.getSnippetsByCategory('Unknown');
      expect(unknownSnippets).toHaveLength(0);
    });
  });

  describe('searchSnippets', () => {
    it('should search snippets by name', () => {
      const results = generator.searchSnippets('Record List');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(s => s.name.includes('Record List'))).toBe(true);
    });

    it('should search snippets by description', () => {
      const results = generator.searchSnippets('API');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(s => s.description.includes('API') || s.name.includes('API'))).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const results = generator.searchSnippets('NonExistentSnippet');
      expect(results).toHaveLength(0);
    });

    it('should be case insensitive', () => {
      const results = generator.searchSnippets('api');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('template replacement', () => {
    it('should replace template variables correctly', () => {
      const snippet = generator.generateSnippet('API Call with Error Handling', {
        endpoint: '/api/custom',
        method: 'POST',
        appId: '42'
      });
      
      expect(snippet).toContain('/api/custom');
      expect(snippet).toContain('POST');
      expect(snippet).toContain('app=42');
    });

    it('should handle array parameters', () => {
      const snippet = generator.generateSnippet('Form Handler', {
        validationRules: ['required', 'email', 'minLength']
      });
      
      expect(snippet).toContain('required');
      expect(snippet).toContain('email');
      expect(snippet).toContain('minLength');
    });

    it('should handle boolean parameters', () => {
      const snippet = generator.generateSnippet('Auto-save', {
        enableConfirmation: true
      });
      
      expect(snippet).toContain('confirm');
    });

    it('should handle number parameters', () => {
      const snippet = generator.generateSnippet('Bulk Operations', {
        batchSize: 25
      });
      
      expect(snippet).toContain('25');
    });
  });

  describe('VS Code integration', () => {
    it('should generate VS Code snippet format', () => {
      const vsCodeSnippet = generator.generateVSCodeSnippet('Record List Event Handler');
      
      expect(vsCodeSnippet).toHaveProperty('prefix');
      expect(vsCodeSnippet).toHaveProperty('body');
      expect(vsCodeSnippet).toHaveProperty('description');
      expect(vsCodeSnippet.body).toBeInstanceOf(Array);
      expect(vsCodeSnippet.body.length).toBeGreaterThan(0);
    });

    it('should include tab stops in VS Code snippet', () => {
      const vsCodeSnippet = generator.generateVSCodeSnippet('API Call with Error Handling');
      
      const bodyText = vsCodeSnippet.body.join('\n');
      expect(bodyText).toContain('${1:');
      expect(bodyText).toContain('${2:');
    });
  });

  describe('snippet validation', () => {
    it('should validate snippet parameters', () => {
      const isValid = generator.validateSnippetParameters('Record List Event Handler', {
        pageType: 'record-list'
      });
      
      expect(isValid).toBe(true);
    });

    it('should detect invalid parameters', () => {
      const isValid = generator.validateSnippetParameters('Record List Event Handler', {
        invalidParam: 'value'
      });
      
      expect(isValid).toBe(false);
    });

    it('should handle missing required parameters', () => {
      const isValid = generator.validateSnippetParameters('API Call with Error Handling', {
        // Missing required endpoint parameter
      });
      
      expect(isValid).toBe(false);
    });
  });
});