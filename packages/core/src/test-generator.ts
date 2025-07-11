/**
 * ktn-bridge 自動テスト生成機能
 * 変換されたコードのテストを自動生成する
 */

export interface TestCase {
  name: string;
  description: string;
  input: any;
  expected: any;
  type: 'unit' | 'integration' | 'e2e';
  category: 'event' | 'api' | 'ui' | 'data';
  setup?: string;
  teardown?: string;
  timeout?: number;
}

export interface TestSuite {
  name: string;
  description: string;
  tests: TestCase[];
  setup?: string;
  teardown?: string;
  imports: string[];
}

export interface TestGenerationOptions {
  framework?: 'vitest' | 'jest' | 'mocha';
  includeIntegrationTests?: boolean;
  includeE2ETests?: boolean;
  mockKintoneAPI?: boolean;
  generateSnapshots?: boolean;
  coverageThreshold?: number;
}

export class TestGenerator {
  private options: TestGenerationOptions;

  constructor(options: TestGenerationOptions = {}) {
    this.options = {
      framework: 'vitest',
      includeIntegrationTests: true,
      includeE2ETests: false,
      mockKintoneAPI: true,
      generateSnapshots: false,
      coverageThreshold: 80,
      ...options
    };
  }

  /**
   * コードからテストスイートを生成
   */
  generateTestSuite(
    originalCode: string,
    transformedCode: string,
    filename: string
  ): TestSuite {
    const tests: TestCase[] = [];
    
    // イベントハンドラーのテストを生成
    tests.push(...this.generateEventHandlerTests(originalCode, transformedCode));
    
    // APIコールのテストを生成
    tests.push(...this.generateApiCallTests(originalCode, transformedCode));
    
    // UI操作のテストを生成
    tests.push(...this.generateUITests(originalCode, transformedCode));
    
    // データ処理のテストを生成
    tests.push(...this.generateDataProcessingTests(originalCode, transformedCode));
    
    // 統合テストを生成
    if (this.options.includeIntegrationTests) {
      tests.push(...this.generateIntegrationTests(originalCode, transformedCode));
    }
    
    // E2Eテストを生成
    if (this.options.includeE2ETests) {
      tests.push(...this.generateE2ETests(originalCode, transformedCode));
    }

    return {
      name: `${filename} Test Suite`,
      description: `Auto-generated tests for ${filename}`,
      tests,
      setup: this.generateSetup(),
      teardown: this.generateTeardown(),
      imports: this.generateImports()
    };
  }

  /**
   * イベントハンドラーのテストを生成
   */
  generateEventHandlerTests(originalCode: string, _transformedCode: string): TestCase[] {
    const tests: TestCase[] = [];
    
    // DOMContentLoadedイベントのテスト
    if (originalCode.includes('DOMContentLoaded')) {
      tests.push({
        name: 'DOMContentLoaded event handler',
        description: 'Should handle page load correctly',
        input: { eventType: 'DOMContentLoaded' },
        expected: { eventHandled: true, kintoneEventCalled: true },
        type: 'unit',
        category: 'event',
        setup: `
          // DOM要素をモック
          const mockPage = document.createElement('div');
          mockPage.setAttribute('data-page', 'record-list');
          document.body.appendChild(mockPage);
        `,
        teardown: `
          // DOM要素をクリーンアップ
          document.body.innerHTML = '';
        `
      });
    }

    // changeイベントのテスト
    if (originalCode.includes("addEventListener('change'")) {
      tests.push({
        name: 'Change event handler',
        description: 'Should handle field changes correctly',
        input: { 
          eventType: 'change',
          target: { name: 'title', value: 'Test Title' }
        },
        expected: { 
          fieldChanged: true,
          kintoneEventCalled: true,
          value: 'Test Title'
        },
        type: 'unit',
        category: 'event',
        setup: `
          // フィールド要素をモック
          const mockField = document.createElement('input');
          mockField.name = 'title';
          mockField.value = 'Test Title';
          document.body.appendChild(mockField);
        `
      });
    }

    // submitイベントのテスト
    if (originalCode.includes("addEventListener('submit'")) {
      tests.push({
        name: 'Submit event handler',
        description: 'Should handle form submission correctly',
        input: { 
          eventType: 'submit',
          formData: { title: 'Test', description: 'Test Description' }
        },
        expected: { 
          formSubmitted: true,
          kintoneEventCalled: true,
          dataProcessed: true
        },
        type: 'unit',
        category: 'event',
        setup: `
          // フォーム要素をモック
          const mockForm = document.createElement('form');
          mockForm.setAttribute('data-form-type', 'record-edit');
          document.body.appendChild(mockForm);
        `
      });
    }

    return tests;
  }

  /**
   * APIコールのテストを生成
   */
  generateApiCallTests(originalCode: string, _transformedCode: string): TestCase[] {
    const tests: TestCase[] = [];

    // fetchの使用を検出
    const fetchMatches = originalCode.match(/fetch\s*\(\s*['"]([^'"]+)['"]/g);
    if (fetchMatches) {
      fetchMatches.forEach(match => {
        const urlMatch = match.match(/['"]([^'"]+)['"]/);
        if (urlMatch) {
          const url = urlMatch[1];
          
          tests.push({
            name: `API call to ${url}`,
            description: `Should make API call to ${url} and handle response`,
            input: { url, method: 'GET' },
            expected: { 
              apiCalled: true,
              responseReceived: true,
              dataProcessed: true
            },
            type: 'unit',
            category: 'api',
            setup: `
              // kintone APIをモック
              ${this.generateKintoneAPIMock()}
            `
          });
        }
      });
    }

    // レコード取得のテスト
    if (originalCode.includes('/api/records')) {
      tests.push({
        name: 'Get records API',
        description: 'Should fetch records from kintone API',
        input: { app: 1, query: '', fields: [] },
        expected: { 
          records: [
            { id: { value: '1' }, title: { value: 'Test Record' } }
          ],
          totalCount: 1
        },
        type: 'integration',
        category: 'api',
        setup: `
          // レコード取得のモック応答
          const mockRecords = [
            { id: { value: '1' }, title: { value: 'Test Record' } }
          ];
          vi.spyOn(kintone.api, 'call').mockResolvedValue({
            records: mockRecords,
            totalCount: 1
          });
        `
      });
    }

    return tests;
  }

  /**
   * UI操作のテストを生成
   */
  generateUITests(originalCode: string, _transformedCode: string): TestCase[] {
    const tests: TestCase[] = [];

    // DOM操作のテスト
    if (originalCode.includes('document.querySelector')) {
      tests.push({
        name: 'DOM element selection',
        description: 'Should select DOM elements correctly',
        input: { selector: '[data-page="record-list"]' },
        expected: { elementFound: true, elementType: 'div' },
        type: 'unit',
        category: 'ui',
        setup: `
          // DOM要素をセットアップ
          const mockElement = document.createElement('div');
          mockElement.setAttribute('data-page', 'record-list');
          document.body.appendChild(mockElement);
        `
      });
    }

    // ボタンクリックのテスト
    if (originalCode.includes('addEventListener(\'click\'')) {
      tests.push({
        name: 'Button click handler',
        description: 'Should handle button clicks correctly',
        input: { 
          eventType: 'click',
          target: { dataset: { action: 'bulk-edit' } }
        },
        expected: { 
          actionTriggered: true,
          customEventDispatched: true
        },
        type: 'unit',
        category: 'ui',
        setup: `
          // ボタン要素をモック
          const mockButton = document.createElement('button');
          mockButton.setAttribute('data-action', 'bulk-edit');
          document.body.appendChild(mockButton);
        `
      });
    }

    return tests;
  }

  /**
   * データ処理のテストを生成
   */
  generateDataProcessingTests(originalCode: string, _transformedCode: string): TestCase[] {
    const tests: TestCase[] = [];

    // データ変換のテスト
    if (originalCode.includes('JSON.parse') || originalCode.includes('JSON.stringify')) {
      tests.push({
        name: 'Data transformation',
        description: 'Should transform data correctly',
        input: { 
          data: { title: 'Test', description: 'Test Description' }
        },
        expected: { 
          transformed: true,
          format: 'kintone',
          fields: ['title', 'description']
        },
        type: 'unit',
        category: 'data'
      });
    }

    // フォームデータ処理のテスト
    if (originalCode.includes('FormData')) {
      tests.push({
        name: 'Form data processing',
        description: 'Should process form data correctly',
        input: { 
          formData: new FormData()
        },
        expected: { 
          processed: true,
          recordFormat: true
        },
        type: 'unit',
        category: 'data'
      });
    }

    return tests;
  }

  /**
   * 統合テストを生成
   */
  generateIntegrationTests(_originalCode: string, _transformedCode: string): TestCase[] {
    const tests: TestCase[] = [];

    // 全体のワークフローテスト
    tests.push({
      name: 'Complete workflow integration',
      description: 'Should handle complete user workflow',
      input: { 
        scenario: 'record-list-to-edit',
        data: { title: 'Integration Test' }
      },
      expected: { 
        workflowCompleted: true,
        recordUpdated: true,
        uiUpdated: true
      },
      type: 'integration',
      category: 'ui',
      setup: `
        // 完全なDOM環境をセットアップ
        ${this.generateFullDOMSetup()}
        
        // kintone APIをモック
        ${this.generateKintoneAPIMock()}
      `,
      timeout: 5000
    });

    return tests;
  }

  /**
   * E2Eテストを生成
   */
  generateE2ETests(_originalCode: string, _transformedCode: string): TestCase[] {
    const tests: TestCase[] = [];

    if (this.options.includeE2ETests) {
      tests.push({
        name: 'End-to-end user flow',
        description: 'Should handle complete user interaction flow',
        input: { 
          userActions: [
            'navigate-to-record-list',
            'click-statistics-button',
            'view-statistics',
            'edit-record',
            'save-record'
          ]
        },
        expected: { 
          allActionsCompleted: true,
          dataConsistent: true,
          uiResponsive: true
        },
        type: 'e2e',
        category: 'ui',
        setup: `
          // E2Eテスト環境をセットアップ
          ${this.generateE2ESetup()}
        `,
        timeout: 10000
      });
    }

    return tests;
  }

  /**
   * テストコードを生成
   */
  generateTestCode(testSuite: TestSuite): string {
    const framework = this.options.framework;
    const testCode: string[] = [];

    // インポート文
    testCode.push(...testSuite.imports);
    testCode.push('');

    // テストスイートの開始
    testCode.push(`describe('${testSuite.name}', () => {`);
    
    // セットアップ
    if (testSuite.setup) {
      testCode.push('  beforeAll(() => {');
      testCode.push(`    ${testSuite.setup}`);
      testCode.push('  });');
      testCode.push('');
    }

    // ティアダウン
    if (testSuite.teardown) {
      testCode.push('  afterAll(() => {');
      testCode.push(`    ${testSuite.teardown}`);
      testCode.push('  });');
      testCode.push('');
    }

    // 各テストケース
    testSuite.tests.forEach(test => {
      testCode.push(`  ${this.generateTestMethod(test, framework || 'vitest')}`);
      testCode.push('');
    });

    // テストスイートの終了
    testCode.push('});');

    return testCode.join('\n');
  }

  /**
   * テストメソッドを生成
   */
  private generateTestMethod(test: TestCase, framework: string): string {
    const testMethod = framework === 'vitest' ? 'it' : 'test';
    const timeout = test.timeout ? `, ${test.timeout}` : '';
    
    const testCode: string[] = [];
    
    testCode.push(`${testMethod}('${test.name}', async () => {`);
    
    // セットアップ
    if (test.setup) {
      testCode.push(`    ${test.setup}`);
      testCode.push('');
    }
    
    // テスト実行
    testCode.push(`    // ${test.description}`);
    testCode.push(`    const input = ${JSON.stringify(test.input, null, 6)};`);
    testCode.push(`    const expected = ${JSON.stringify(test.expected, null, 6)};`);
    testCode.push('');
    testCode.push('    // Act');
    testCode.push('    const result = await executeTest(input);');
    testCode.push('');
    testCode.push('    // Assert');
    testCode.push('    expect(result).toEqual(expected);');
    
    // ティアダウン
    if (test.teardown) {
      testCode.push('');
      testCode.push(`    ${test.teardown}`);
    }
    
    testCode.push(`  }${timeout});`);
    
    return testCode.join('\n');
  }

  /**
   * セットアップコードを生成
   */
  private generateSetup(): string {
    return `
      // グローバルセットアップ
      global.kintone = ${this.generateKintoneAPIMock()};
      
      // DOM環境のセットアップ
      ${this.generateDOMSetup()}
    `;
  }

  /**
   * ティアダウンコードを生成
   */
  private generateTeardown(): string {
    return `
      // グローバルティアダウン
      document.body.innerHTML = '';
      vi.clearAllMocks();
    `;
  }

  /**
   * インポート文を生成
   */
  private generateImports(): string[] {
    const imports: string[] = [];
    
    if (this.options.framework === 'vitest') {
      imports.push("import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';");
    } else if (this.options.framework === 'jest') {
      imports.push("import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';");
    }
    
    if (this.options.mockKintoneAPI) {
      imports.push("import { createKintoneMock } from './mocks/kintone-mock';");
    }
    
    return imports;
  }

  /**
   * kintone APIモックを生成
   */
  private generateKintoneAPIMock(): string {
    return `
      {
        api: vi.fn().mockImplementation((url, method, params) => {
          // モック応答を返す
          if (url === '/k/v1/records' && method === 'GET') {
            return Promise.resolve({
              records: [
                { id: { value: '1' }, title: { value: 'Test Record' } }
              ],
              totalCount: 1
            });
          }
          
          if (url === '/k/v1/record' && method === 'POST') {
            return Promise.resolve({
              id: '123',
              revision: '1'
            });
          }
          
          if (url === '/k/v1/record' && method === 'PUT') {
            return Promise.resolve({
              revision: '2'
            });
          }
          
          return Promise.resolve({});
        }),
        
        events: {
          on: vi.fn().mockImplementation((eventType, callback) => {
            // イベントハンドラーをモック
            return callback;
          })
        },
        
        app: {
          getId: vi.fn().mockReturnValue('1'),
          record: {
            getId: vi.fn().mockReturnValue('123')
          }
        }
      }
    `;
  }

  /**
   * DOM環境のセットアップを生成
   */
  private generateDOMSetup(): string {
    return `
      // DOM環境のセットアップ
      document.body.innerHTML = '';
      
      // 基本的なDOM構造を作成
      const mockApp = document.createElement('div');
      mockApp.setAttribute('data-page', 'record-list');
      document.body.appendChild(mockApp);
    `;
  }

  /**
   * 完全なDOM環境のセットアップを生成
   */
  private generateFullDOMSetup(): string {
    return `
      // 完全なDOM環境のセットアップ
      document.body.innerHTML = \`
        <div data-page="record-list">
          <div class="toolbar">
            <button data-action="bulk-edit">一括編集</button>
          </div>
          <div id="statistics-container" style="display: none;"></div>
          <form data-form-type="record-edit">
            <input name="title" type="text" value="Test Title">
            <textarea name="description">Test Description</textarea>
            <button type="submit">保存</button>
          </form>
        </div>
      \`;
    `;
  }

  /**
   * E2Eテスト環境のセットアップを生成
   */
  private generateE2ESetup(): string {
    return `
      // E2Eテスト環境のセットアップ
      // 実際のブラウザ環境をエミュレート
      ${this.generateFullDOMSetup()}
      
      // ユーザーアクションのシミュレート
      const simulateUserAction = (action) => {
        switch (action) {
          case 'navigate-to-record-list':
            window.dispatchEvent(new Event('DOMContentLoaded'));
            break;
          case 'click-statistics-button':
            const statsButton = document.querySelector('[data-action="statistics"]');
            if (statsButton) statsButton.click();
            break;
          default:
            console.log('Unknown action:', action);
        }
      };
    `;
  }

  /**
   * テストカバレッジレポートを生成
   */
  generateCoverageReport(testSuite: TestSuite): string {
    const report = [
      '# Test Coverage Report',
      '',
      `## Suite: ${testSuite.name}`,
      `Total Tests: ${testSuite.tests.length}`,
      '',
      '## Coverage by Category',
      ...this.generateCategoryCoverage(testSuite),
      '',
      '## Test Types',
      ...this.generateTypeCoverage(testSuite)
    ];

    return report.join('\n');
  }

  private generateCategoryCoverage(testSuite: TestSuite): string[] {
    const categories = ['event', 'api', 'ui', 'data'];
    const coverage: string[] = [];

    categories.forEach(category => {
      const categoryTests = testSuite.tests.filter(test => test.category === category);
      coverage.push(`- ${category}: ${categoryTests.length} tests`);
    });

    return coverage;
  }

  private generateTypeCoverage(testSuite: TestSuite): string[] {
    const types = ['unit', 'integration', 'e2e'];
    const coverage: string[] = [];

    types.forEach(type => {
      const typeTests = testSuite.tests.filter(test => test.type === type);
      coverage.push(`- ${type}: ${typeTests.length} tests`);
    });

    return coverage;
  }
}

export const globalTestGenerator = new TestGenerator();

export default TestGenerator;