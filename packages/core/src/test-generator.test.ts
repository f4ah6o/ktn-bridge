import { describe, it, expect, beforeEach } from 'vitest';
import { TestGenerator } from './test-generator';

describe('TestGenerator', () => {
  let generator: TestGenerator;

  beforeEach(() => {
    generator = new TestGenerator();
  });

  describe('generateTestSuite', () => {
    it('should generate test suite with unit tests', () => {
      const originalCode = `
        document.addEventListener('DOMContentLoaded', (event) => {
          console.log('Page loaded');
        });
      `;
      
      const transformedCode = `
        kintone.events.on('app.record.index.show', (event) => {
          console.log('Page loaded');
          return event;
        });
      `;
      
      const suite = generator.generateTestSuite(originalCode, transformedCode, 'test-file.ts');
      
      expect(suite.filename).toBe('test-file.ts');
      expect(suite.tests.length).toBeGreaterThan(0);
      expect(suite.tests.some(test => test.type === 'unit')).toBe(true);
    });

    it('should generate integration tests for API calls', () => {
      const originalCode = `
        const response = await fetch('/api/records?app=1');
        const data = await response.json();
      `;
      
      const transformedCode = `
        const response = await kintone.api('/k/v1/records', 'GET', {app: 1});
      `;
      
      const suite = generator.generateTestSuite(originalCode, transformedCode, 'api-test.ts');
      
      expect(suite.tests.some(test => test.type === 'integration')).toBe(true);
      expect(suite.tests.some(test => test.name.includes('API'))).toBe(true);
    });

    it('should generate form tests for form submissions', () => {
      const originalCode = `
        document.addEventListener('submit', (event) => {
          event.preventDefault();
          const formData = new FormData(event.target);
        });
      `;
      
      const transformedCode = `
        kintone.events.on('app.record.edit.submit', (event) => {
          // Form submission logic
          return event;
        });
      `;
      
      const suite = generator.generateTestSuite(originalCode, transformedCode, 'form-test.ts');
      
      expect(suite.tests.some(test => test.name.includes('form'))).toBe(true);
    });

    it('should generate event handler tests', () => {
      const originalCode = `
        document.addEventListener('click', (event) => {
          if (event.target.matches('.button')) {
            console.log('Button clicked');
          }
        });
      `;
      
      const transformedCode = `
        kintone.events.on('app.record.detail.show', (event) => {
          // Click handling logic
          return event;
        });
      `;
      
      const suite = generator.generateTestSuite(originalCode, transformedCode, 'event-test.ts');
      
      expect(suite.tests.some(test => test.name.includes('event'))).toBe(true);
    });
  });

  describe('generateTestCode', () => {
    it('should generate Vitest compatible test code', () => {
      const suite = generator.generateTestSuite(
        'console.log("test");',
        'console.log("test");',
        'simple-test.ts'
      );
      
      const testCode = generator.generateTestCode(suite);
      
      expect(testCode).toContain('import { describe, it, expect }');
      expect(testCode).toContain('describe(');
      expect(testCode).toContain('it(');
      expect(testCode).toContain('expect(');
    });

    it('should generate test code with mock setup', () => {
      const originalCode = `
        const response = await fetch('/api/records');
      `;
      
      const suite = generator.generateTestSuite(originalCode, originalCode, 'api-test.ts');
      const testCode = generator.generateTestCode(suite);
      
      expect(testCode).toContain('vi.mock');
      expect(testCode).toContain('fetch');
    });

    it('should generate test code with DOM setup for event tests', () => {
      const originalCode = `
        document.addEventListener('DOMContentLoaded', () => {});
      `;
      
      const suite = generator.generateTestSuite(originalCode, originalCode, 'dom-test.ts');
      const testCode = generator.generateTestCode(suite);
      
      expect(testCode).toContain('document');
      expect(testCode).toContain('addEventListener');
    });
  });

  describe('generateFormTests', () => {
    it('should generate form validation tests', () => {
      const originalCode = `
        const form = document.querySelector('form');
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          const formData = new FormData(form);
        });
      `;
      
      const transformedCode = `
        kintone.events.on('app.record.edit.submit', (event) => {
          // Form handling
          return event;
        });
      `;
      
      const tests = generator.generateFormTests(originalCode, transformedCode);
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests.some(test => test.name.includes('form'))).toBe(true);
      expect(tests.some(test => test.name.includes('validation'))).toBe(true);
    });

    it('should handle empty form code', () => {
      const tests = generator.generateFormTests('', '');
      expect(tests).toHaveLength(0);
    });
  });

  describe('generateApiTests', () => {
    it('should generate API test cases', () => {
      const originalCode = `
        const response = await fetch('/api/records?app=1');
        const data = await response.json();
      `;
      
      const transformedCode = `
        const response = await kintone.api('/k/v1/records', 'GET', {app: 1});
      `;
      
      const tests = generator.generateApiTests(originalCode, transformedCode);
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests.some(test => test.name.includes('API'))).toBe(true);
      expect(tests.some(test => test.name.includes('success'))).toBe(true);
      expect(tests.some(test => test.name.includes('error'))).toBe(true);
    });

    it('should handle code without API calls', () => {
      const tests = generator.generateApiTests('console.log("test");', 'console.log("test");');
      expect(tests).toHaveLength(0);
    });
  });

  describe('generateEventHandlerTests', () => {
    it('should generate event handler tests', () => {
      const originalCode = `
        document.addEventListener('click', (event) => {
          console.log('Clicked');
        });
      `;
      
      const transformedCode = `
        kintone.events.on('app.record.detail.show', (event) => {
          console.log('Clicked');
          return event;
        });
      `;
      
      const tests = generator.generateEventHandlerTests(originalCode, transformedCode);
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests.some(test => test.name.includes('event'))).toBe(true);
    });

    it('should handle code without event handlers', () => {
      const tests = generator.generateEventHandlerTests('const x = 1;', 'const x = 1;');
      expect(tests).toHaveLength(0);
    });
  });

  describe('generateE2ETests', () => {
    it('should generate E2E test scenarios', () => {
      const originalCode = `
        document.addEventListener('DOMContentLoaded', async () => {
          const response = await fetch('/api/records');
          const data = await response.json();
          document.getElementById('list').innerHTML = data.records.map(r => r.title).join('');
        });
      `;
      
      const transformedCode = `
        kintone.events.on('app.record.index.show', async (event) => {
          const response = await kintone.api('/k/v1/records', 'GET', {app: 1});
          // Update UI
          return event;
        });
      `;
      
      const tests = generator.generateE2ETests(originalCode, transformedCode);
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests.some(test => test.name.includes('E2E'))).toBe(true);
      expect(tests.some(test => test.name.includes('workflow'))).toBe(true);
    });
  });

  describe('generateMockSetup', () => {
    it('should generate mock setup for API calls', () => {
      const code = `
        const response = await fetch('/api/records');
        const kintoneResponse = await kintone.api('/k/v1/records', 'GET');
      `;
      
      const mockSetup = generator.generateMockSetup(code);
      
      expect(mockSetup).toContain('vi.mock');
      expect(mockSetup).toContain('fetch');
      expect(mockSetup).toContain('kintone.api');
    });

    it('should generate mock setup for DOM elements', () => {
      const code = `
        document.getElementById('test');
        document.querySelector('.button');
      `;
      
      const mockSetup = generator.generateMockSetup(code);
      
      expect(mockSetup).toContain('document');
      expect(mockSetup).toContain('getElementById');
      expect(mockSetup).toContain('querySelector');
    });

    it('should handle code without mocks needed', () => {
      const mockSetup = generator.generateMockSetup('const x = 1;');
      expect(mockSetup).toBe('');
    });
  });

  describe('patterns detection', () => {
    it('should detect fetch patterns', () => {
      const code = 'await fetch("/api/test")';
      const tests = generator.generateApiTests(code, code);
      expect(tests.length).toBeGreaterThan(0);
    });

    it('should detect form patterns', () => {
      const code = 'new FormData(form)';
      const tests = generator.generateFormTests(code, code);
      expect(tests.length).toBeGreaterThan(0);
    });

    it('should detect event patterns', () => {
      const code = 'addEventListener("click", handler)';
      const tests = generator.generateEventHandlerTests(code, code);
      expect(tests.length).toBeGreaterThan(0);
    });
  });
});