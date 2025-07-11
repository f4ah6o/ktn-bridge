/**
 * ktn-bridge コードスニペット生成機能
 * 開発効率向上のためのコードスニペット自動生成
 */

export interface CodeSnippet {
  name: string;
  description: string;
  prefix: string;
  body: string[];
  category: string;
  language: string;
  tags: string[];
  parameters?: Array<{
    name: string;
    description: string;
    type: string;
    default?: string;
    required?: boolean;
  }>;
  example?: string;
  relatedPatterns?: string[];
}

export interface SnippetTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: Array<{
    name: string;
    description: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    default?: any;
    options?: string[];
  }>;
}

export class SnippetGenerator {
  private snippets: Map<string, CodeSnippet> = new Map();
  private templates: Map<string, SnippetTemplate> = new Map();

  constructor() {
    this.loadDefaultSnippets();
    this.loadDefaultTemplates();
  }

  /**
   * デフォルトスニペットをロード
   */
  private loadDefaultSnippets(): void {
    const defaultSnippets: CodeSnippet[] = [
      {
        name: 'Record List Event Handler',
        description: 'レコード一覧画面のイベントハンドラー',
        prefix: 'ktn-record-list',
        body: [
          'document.addEventListener(\'DOMContentLoaded\', (event) => {',
          '  const page = document.querySelector(\'[data-page="record-list"]\');',
          '  if (page) {',
          '    console.log(\'レコード一覧が表示されました\');',
          '    ${1:// 処理を記述}',
          '  }',
          '});'
        ],
        category: 'events',
        language: 'typescript',
        tags: ['event', 'record-list', 'basic'],
        parameters: [
          {
            name: 'pageType',
            description: 'ページタイプ',
            type: 'string',
            default: 'record-list',
            required: true
          }
        ],
        example: `
document.addEventListener('DOMContentLoaded', (event) => {
  const page = document.querySelector('[data-page="record-list"]');
  if (page) {
    console.log('レコード一覧が表示されました');
    initializeRecordList();
  }
});`,
        relatedPatterns: ['record-detail', 'field-change']
      },
      
      {
        name: 'Field Change Handler',
        description: 'フィールド値変更時のハンドラー',
        prefix: 'ktn-field-change',
        body: [
          'document.addEventListener(\'change\', (event) => {',
          '  const target = event.target as HTMLInputElement;',
          '  if (target.name === \'${1:fieldName}\') {',
          '    console.log(\'フィールドが変更されました:\', target.value);',
          '    ${2:// 処理を記述}',
          '  }',
          '});'
        ],
        category: 'events',
        language: 'typescript',
        tags: ['event', 'field', 'change'],
        parameters: [
          {
            name: 'fieldName',
            description: 'フィールド名',
            type: 'string',
            required: true
          }
        ]
      },
      
      {
        name: 'API Record Fetch',
        description: 'レコード取得API',
        prefix: 'ktn-fetch-records',
        body: [
          'try {',
          '  const response = await fetch(\'/api/records?app=${1:appId}\');',
          '  const data = await response.json();',
          '  console.log(\'取得したレコード:\', data.records);',
          '  ${2:// データ処理}',
          '} catch (error) {',
          '  console.error(\'レコード取得エラー:\', error);',
          '}'
        ],
        category: 'api',
        language: 'typescript',
        tags: ['api', 'fetch', 'records'],
        parameters: [
          {
            name: 'appId',
            description: 'アプリID',
            type: 'number',
            required: true
          }
        ]
      },
      
      {
        name: 'Auto Save Function',
        description: '自動保存機能',
        prefix: 'ktn-auto-save',
        body: [
          'async function autoSave(fieldName: string, value: string) {',
          '  try {',
          '    const response = await fetch(\'/api/record/auto-save\', {',
          '      method: \'POST\',',
          '      headers: { \'Content-Type\': \'application/json\' },',
          '      body: JSON.stringify({ fieldName, value })',
          '    });',
          '    ',
          '    if (response.ok) {',
          '      showSaveIndicator(\'success\');',
          '    }',
          '  } catch (error) {',
          '    showSaveIndicator(\'error\');',
          '  }',
          '}',
          '',
          'document.addEventListener(\'change\', async (event) => {',
          '  const target = event.target as HTMLInputElement;',
          '  if (target.name === \'${1:fieldName}\') {',
          '    await autoSave(target.name, target.value);',
          '  }',
          '});'
        ],
        category: 'features',
        language: 'typescript',
        tags: ['auto-save', 'advanced', 'utility'],
        parameters: [
          {
            name: 'fieldName',
            description: 'フィールド名',
            type: 'string',
            required: true
          }
        ]
      },
      
      {
        name: 'Bulk Operations',
        description: '一括操作機能',
        prefix: 'ktn-bulk-operations',
        body: [
          'document.addEventListener(\'click\', (event) => {',
          '  const target = event.target as HTMLElement;',
          '  if (target.matches(\'[data-action="bulk-edit"]\')) {',
          '    const selectedRecords = getSelectedRecords();',
          '    ',
          '    const bulkEvent = new CustomEvent(\'bulkEditStart\', {',
          '      detail: { selectedRecords }',
          '    });',
          '    ',
          '    document.dispatchEvent(bulkEvent);',
          '  }',
          '});',
          '',
          'document.addEventListener(\'bulkEditStart\', async (event) => {',
          '  const { selectedRecords } = event.detail;',
          '  ',
          '  try {',
          '    for (const recordId of selectedRecords) {',
          '      await updateRecord(recordId, { ${1:fieldName}: \'${2:value}\' });',
          '    }',
          '    ',
          '    showNotification(\'一括更新が完了しました\');',
          '  } catch (error) {',
          '    showNotification(\'一括更新に失敗しました\');',
          '  }',
          '});'
        ],
        category: 'features',
        language: 'typescript',
        tags: ['bulk', 'advanced', 'custom-event'],
        parameters: [
          {
            name: 'fieldName',
            description: 'フィールド名',
            type: 'string',
            required: true
          },
          {
            name: 'value',
            description: '設定値',
            type: 'string',
            required: true
          }
        ]
      },
      
      {
        name: 'Error Handling Template',
        description: 'エラーハンドリングテンプレート',
        prefix: 'ktn-error-handling',
        body: [
          'try {',
          '  ${1:// メイン処理}',
          '} catch (error) {',
          '  console.error(\'エラーが発生しました:\', error);',
          '  ',
          '  // エラー通知を表示',
          '  showNotification(\'エラーが発生しました\', \'error\');',
          '  ',
          '  // 必要に応じて再試行やフォールバック処理',
          '  ${2:// フォールバック処理}',
          '}'
        ],
        category: 'utility',
        language: 'typescript',
        tags: ['error', 'handling', 'template']
      },
      
      {
        name: 'Validation Helper',
        description: '入力値検証ヘルパー',
        prefix: 'ktn-validation',
        body: [
          'function validateField(fieldName: string, value: any): { valid: boolean; message?: string } {',
          '  switch (fieldName) {',
          '    case \'${1:fieldName}\':',
          '      if (!value || value.trim() === \'\') {',
          '        return { valid: false, message: \'${2:fieldName}は必須です\' };',
          '      }',
          '      if (value.length > ${3:100}) {',
          '        return { valid: false, message: \'${2:fieldName}は${3:100}文字以内で入力してください\' };',
          '      }',
          '      return { valid: true };',
          '      ',
          '    default:',
          '      return { valid: true };',
          '  }',
          '}',
          '',
          'document.addEventListener(\'change\', (event) => {',
          '  const target = event.target as HTMLInputElement;',
          '  const validation = validateField(target.name, target.value);',
          '  ',
          '  if (!validation.valid) {',
          '    showValidationError(target, validation.message);',
          '  } else {',
          '    clearValidationError(target);',
          '  }',
          '});'
        ],
        category: 'utility',
        language: 'typescript',
        tags: ['validation', 'helper', 'form'],
        parameters: [
          {
            name: 'fieldName',
            description: 'フィールド名',
            type: 'string',
            required: true
          },
          {
            name: 'maxLength',
            description: '最大文字数',
            type: 'number',
            default: '100'
          }
        ]
      }
    ];

    defaultSnippets.forEach(snippet => {
      this.snippets.set(snippet.name, snippet);
    });
  }

  /**
   * デフォルトテンプレートをロード
   */
  private loadDefaultTemplates(): void {
    const defaultTemplates: SnippetTemplate[] = [
      {
        id: 'event-handler',
        name: 'Event Handler Template',
        description: 'イベントハンドラーのテンプレート',
        template: `
document.addEventListener('{{eventType}}', (event) => {
  {{#if selector}}
  const target = event.target as {{targetType}};
  if (target.matches('{{selector}}')) {
    {{#each actions}}
    {{this}}
    {{/each}}
  }
  {{else}}
  {{#each actions}}
  {{this}}
  {{/each}}
  {{/if}}
});`,
        variables: [
          {
            name: 'eventType',
            description: 'イベントタイプ',
            type: 'string',
            default: 'click',
            options: ['click', 'change', 'submit', 'DOMContentLoaded']
          },
          {
            name: 'selector',
            description: 'セレクター',
            type: 'string',
            default: ''
          },
          {
            name: 'targetType',
            description: 'ターゲット要素の型',
            type: 'string',
            default: 'HTMLElement'
          },
          {
            name: 'actions',
            description: '実行する処理',
            type: 'array',
            default: ['console.log("Event triggered");']
          }
        ]
      },
      
      {
        id: 'api-call',
        name: 'API Call Template',
        description: 'API呼び出しのテンプレート',
        template: `
async function {{functionName}}({{#each parameters}}{{name}}: {{type}}{{#unless @last}}, {{/unless}}{{/each}}) {
  try {
    const response = await fetch('{{endpoint}}', {
      method: '{{method}}',
      {{#if needsBody}}
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({{bodyData}})
      {{/if}}
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    {{#each postActions}}
    {{this}}
    {{/each}}
    
    return data;
  } catch (error) {
    console.error('{{functionName}} error:', error);
    {{#each errorActions}}
    {{this}}
    {{/each}}
    throw error;
  }
}`,
        variables: [
          {
            name: 'functionName',
            description: '関数名',
            type: 'string',
            default: 'apiCall'
          },
          {
            name: 'endpoint',
            description: 'APIエンドポイント',
            type: 'string',
            default: '/api/records'
          },
          {
            name: 'method',
            description: 'HTTPメソッド',
            type: 'string',
            default: 'GET',
            options: ['GET', 'POST', 'PUT', 'DELETE']
          },
          {
            name: 'parameters',
            description: '関数パラメータ',
            type: 'array',
            default: []
          },
          {
            name: 'needsBody',
            description: 'リクエストボディが必要か',
            type: 'boolean',
            default: false
          },
          {
            name: 'bodyData',
            description: 'リクエストボディデータ',
            type: 'string',
            default: 'params'
          },
          {
            name: 'postActions',
            description: 'レスポンス後の処理',
            type: 'array',
            default: ['console.log("API call successful:", data);']
          },
          {
            name: 'errorActions',
            description: 'エラー時の処理',
            type: 'array',
            default: ['showNotification("エラーが発生しました", "error");']
          }
        ]
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * スニペットを生成
   */
  generateSnippet(name: string, parameters: Record<string, any> = {}): string {
    const snippet = this.snippets.get(name);
    if (!snippet) {
      throw new Error(`Snippet '${name}' not found`);
    }

    let body = snippet.body.join('\n');
    
    // パラメータ置換
    snippet.parameters?.forEach(param => {
      const value = parameters[param.name] || param.default || '';
      const placeholder = `\${${param.name}}`;
      body = body.replace(new RegExp(placeholder, 'g'), value);
    });

    return body;
  }

  /**
   * テンプレートからスニペットを生成
   */
  generateFromTemplate(templateId: string, variables: Record<string, any> = {}): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template '${templateId}' not found`);
    }

    let result = template.template;
    
    // 変数置換（簡易版）
    template.variables.forEach(variable => {
      const value = variables[variable.name] || variable.default || '';
      const placeholder = `{{${variable.name}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return result;
  }

  /**
   * カスタムスニペットを追加
   */
  addCustomSnippet(snippet: CodeSnippet): void {
    this.snippets.set(snippet.name, snippet);
  }

  /**
   * スニペットを更新
   */
  updateSnippet(name: string, updates: Partial<CodeSnippet>): void {
    const existing = this.snippets.get(name);
    if (!existing) {
      throw new Error(`Snippet '${name}' not found`);
    }

    const updated = { ...existing, ...updates };
    this.snippets.set(name, updated);
  }

  /**
   * スニペットを削除
   */
  removeSnippet(name: string): void {
    this.snippets.delete(name);
  }

  /**
   * スニペット一覧を取得
   */
  getSnippets(filter?: {
    category?: string;
    language?: string;
    tags?: string[];
  }): CodeSnippet[] {
    let snippets = Array.from(this.snippets.values());

    if (filter) {
      if (filter.category) {
        snippets = snippets.filter(s => s.category === filter.category);
      }
      if (filter.language) {
        snippets = snippets.filter(s => s.language === filter.language);
      }
      if (filter.tags) {
        snippets = snippets.filter(s => 
          filter.tags!.some(tag => s.tags.includes(tag))
        );
      }
    }

    return snippets;
  }

  /**
   * スニペットを検索
   */
  searchSnippets(query: string): CodeSnippet[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.snippets.values()).filter(snippet => 
      snippet.name.toLowerCase().includes(lowerQuery) ||
      snippet.description.toLowerCase().includes(lowerQuery) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * VS Code用のスニペットファイルを生成
   */
  generateVSCodeSnippets(): string {
    const vscodeSnippets: Record<string, any> = {};

    this.snippets.forEach((snippet, name) => {
      vscodeSnippets[name] = {
        prefix: snippet.prefix,
        body: snippet.body,
        description: snippet.description
      };
    });

    return JSON.stringify(vscodeSnippets, null, 2);
  }

  /**
   * スニペットの使用統計を生成
   */
  generateUsageStats(): {
    totalSnippets: number;
    byCategory: Record<string, number>;
    byLanguage: Record<string, number>;
    mostUsedTags: string[];
  } {
    const snippets = Array.from(this.snippets.values());
    
    const byCategory = snippets.reduce((acc, snippet) => {
      acc[snippet.category] = (acc[snippet.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLanguage = snippets.reduce((acc, snippet) => {
      acc[snippet.language] = (acc[snippet.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const allTags = snippets.flatMap(s => s.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    return {
      totalSnippets: snippets.length,
      byCategory,
      byLanguage,
      mostUsedTags
    };
  }

  /**
   * スニペットをマークダウン形式で出力
   */
  generateMarkdownDocs(): string {
    const snippets = Array.from(this.snippets.values());
    const categories = [...new Set(snippets.map(s => s.category))];

    const docs = [
      '# ktn-bridge Code Snippets',
      '',
      'Collection of code snippets for ktn-bridge development.',
      ''
    ];

    categories.forEach(category => {
      const categorySnippets = snippets.filter(s => s.category === category);
      
      docs.push(`## ${category}`);
      docs.push('');

      categorySnippets.forEach(snippet => {
        docs.push(`### ${snippet.name}`);
        docs.push('');
        docs.push(`**Description**: ${snippet.description}`);
        docs.push(`**Prefix**: \`${snippet.prefix}\``);
        docs.push(`**Tags**: ${snippet.tags.join(', ')}`);
        docs.push('');
        docs.push('```typescript');
        docs.push(snippet.body.join('\n'));
        docs.push('```');
        docs.push('');

        if (snippet.example) {
          docs.push('**Example**:');
          docs.push('');
          docs.push('```typescript');
          docs.push(snippet.example);
          docs.push('```');
          docs.push('');
        }
      });
    });

    return docs.join('\n');
  }
}

export const globalSnippetGenerator = new SnippetGenerator();

export default SnippetGenerator;