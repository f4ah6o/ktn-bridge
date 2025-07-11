/**
 * ktn-bridge よく使用されるパターンライブラリ
 * 実際のkintone開発でよく使われるパターンを定義
 */

export interface Pattern {
  name: string;
  description: string;
  category: string;
  webStandard: string;
  kintoneEquivalent: string;
  example: {
    web: string;
    kintone: string;
    usage: string;
  };
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  since?: string;
}

export const patterns: Pattern[] = [
  {
    name: 'レコード一覧表示時の初期化',
    description: 'レコード一覧画面が表示された時の基本的な初期化処理',
    category: 'initialization',
    webStandard: 'DOMContentLoaded',
    kintoneEquivalent: 'app.record.index.show',
    example: {
      web: `
document.addEventListener('DOMContentLoaded', (event) => {
  const page = document.querySelector('[data-page="record-list"]');
  if (page) {
    console.log('レコード一覧が表示されました');
    // 初期化処理
  }
});`,
      kintone: `
kintone.events.on('app.record.index.show', (event) => {
  console.log('レコード一覧が表示されました');
  // 初期化処理
  return event;
});`,
      usage: `
// 使用例: レコード一覧でのカスタマイズ
document.addEventListener('DOMContentLoaded', (event) => {
  const page = document.querySelector('[data-page="record-list"]');
  if (page) {
    // カスタムボタンを追加
    addCustomButton();
    // 統計情報を表示
    showStatistics();
  }
});`
    },
    tags: ['initialization', 'record-list', 'basic'],
    difficulty: 'beginner'
  },
  
  {
    name: '自動保存機能',
    description: 'フィールドの値が変更された時に自動で保存する機能',
    category: 'auto-save',
    webStandard: 'change event',
    kintoneEquivalent: 'app.record.edit.change',
    example: {
      web: `
document.addEventListener('change', async (event) => {
  const target = event.target as HTMLInputElement;
  if (target.name === 'title') {
    await autoSave(target.name, target.value);
  }
});

async function autoSave(fieldName: string, value: string) {
  try {
    const response = await fetch('/api/record/auto-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldName, value })
    });
    
    if (response.ok) {
      showSaveIndicator('success');
    }
  } catch (error) {
    showSaveIndicator('error');
  }
}`,
      kintone: `
kintone.events.on('app.record.edit.change.title', async (event) => {
  const newValue = event.changes.field.value;
  
  try {
    // 自動保存処理
    const response = await kintone.api('/k/v1/record', 'PUT', {
      app: kintone.app.getId(),
      id: kintone.app.record.getId(),
      record: {
        title: { value: newValue }
      }
    });
    
    showSaveIndicator('success');
  } catch (error) {
    showSaveIndicator('error');
  }
  
  return event;
});`,
      usage: `
// 使用例: 重要なフィールドの自動保存
document.addEventListener('change', async (event) => {
  const target = event.target as HTMLInputElement;
  const autoSaveFields = ['title', 'description', 'priority'];
  
  if (autoSaveFields.includes(target.name)) {
    await autoSave(target.name, target.value);
  }
});`
    },
    tags: ['auto-save', 'field-change', 'intermediate'],
    difficulty: 'intermediate'
  },
  
  {
    name: '一括操作パターン',
    description: '複数のレコードを一括で操作する機能',
    category: 'bulk-operations',
    webStandard: 'custom event',
    kintoneEquivalent: 'custom bulk processing',
    example: {
      web: `
// 一括操作の開始
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('[data-action="bulk-edit"]')) {
    const selectedRecords = getSelectedRecords();
    
    const bulkEvent = new CustomEvent('bulkEditStart', {
      detail: { selectedRecords }
    });
    
    document.dispatchEvent(bulkEvent);
  }
});

// 一括操作の処理
document.addEventListener('bulkEditStart', async (event) => {
  const { selectedRecords } = event.detail;
  
  try {
    for (const recordId of selectedRecords) {
      await updateRecord(recordId);
    }
    
    showNotification('一括更新が完了しました');
  } catch (error) {
    showNotification('一括更新に失敗しました');
  }
});`,
      kintone: `
// 一括操作の開始
kintone.events.on('app.record.index.show', (event) => {
  const menuEl = kintone.app.getHeaderMenuSpaceElement();
  const bulkButton = document.createElement('button');
  bulkButton.textContent = '一括編集';
  
  bulkButton.addEventListener('click', async () => {
    const selectedRecords = getSelectedRecords();
    
    try {
      for (const recordId of selectedRecords) {
        await kintone.api('/k/v1/record', 'PUT', {
          app: kintone.app.getId(),
          id: recordId,
          record: { /* 更新データ */ }
        });
      }
      
      alert('一括更新が完了しました');
    } catch (error) {
      alert('一括更新に失敗しました');
    }
  });
  
  menuEl.appendChild(bulkButton);
  return event;
});`,
      usage: `
// 使用例: ステータスの一括変更
document.addEventListener('bulkEditStart', async (event) => {
  const { selectedRecords, newStatus } = event.detail;
  
  const promises = selectedRecords.map(recordId => 
    updateRecord(recordId, { status: newStatus })
  );
  
  await Promise.all(promises);
});`
    },
    tags: ['bulk-operations', 'custom-events', 'advanced'],
    difficulty: 'advanced'
  },
  
  {
    name: '関連レコード自動読み込み',
    description: 'レコード詳細画面で関連レコードを自動的に読み込む',
    category: 'data-fetching',
    webStandard: 'fetch API',
    kintoneEquivalent: 'kintone.api',
    example: {
      web: `
document.addEventListener('DOMContentLoaded', async (event) => {
  const page = document.querySelector('[data-page="record-detail"]');
  if (page) {
    const recordId = page.dataset.recordId;
    if (recordId) {
      await loadRelatedRecords(recordId);
    }
  }
});

async function loadRelatedRecords(recordId: string) {
  try {
    const response = await fetch(\`/api/records?filter=related_to=\${recordId}\`);
    const data = await response.json();
    
    displayRelatedRecords(data.records);
  } catch (error) {
    console.error('関連レコードの読み込みに失敗:', error);
  }
}`,
      kintone: `
kintone.events.on('app.record.detail.show', async (event) => {
  const recordId = event.recordId;
  
  try {
    const response = await kintone.api('/k/v1/records', 'GET', {
      app: RELATED_APP_ID,
      query: \`parent_record_id = "\${recordId}"\`
    });
    
    displayRelatedRecords(response.records);
  } catch (error) {
    console.error('関連レコードの読み込みに失敗:', error);
  }
  
  return event;
});`,
      usage: `
// 使用例: 親子関係のあるレコードの自動読み込み
async function loadRelatedRecords(recordId: string) {
  const [children, attachments, comments] = await Promise.all([
    fetch(\`/api/records?parent_id=\${recordId}\`).then(r => r.json()),
    fetch(\`/api/attachments?record_id=\${recordId}\`).then(r => r.json()),
    fetch(\`/api/comments?record_id=\${recordId}\`).then(r => r.json())
  ]);
  
  displayRelatedData({ children, attachments, comments });
}`
    },
    tags: ['data-fetching', 'related-records', 'intermediate'],
    difficulty: 'intermediate'
  },
  
  {
    name: '入力値検証パターン',
    description: 'フォーム送信前の入力値検証',
    category: 'validation',
    webStandard: 'form validation',
    kintoneEquivalent: 'app.record.create.submit.success',
    example: {
      web: `
document.addEventListener('submit', (event) => {
  const form = event.target as HTMLFormElement;
  
  if (form.dataset.formType === 'record-edit') {
    const isValid = validateForm(form);
    
    if (!isValid) {
      event.preventDefault();
      showValidationErrors();
    }
  }
});

function validateForm(form: HTMLFormElement): boolean {
  const title = form.querySelector('[name="title"]') as HTMLInputElement;
  const priority = form.querySelector('[name="priority"]') as HTMLSelectElement;
  
  const errors: string[] = [];
  
  if (!title.value.trim()) {
    errors.push('タイトルは必須です');
  }
  
  if (title.value.length > 100) {
    errors.push('タイトルは100文字以内で入力してください');
  }
  
  if (!priority.value) {
    errors.push('優先度を選択してください');
  }
  
  return errors.length === 0;
}`,
      kintone: `
kintone.events.on('app.record.create.submit', (event) => {
  const record = event.record;
  const errors = [];
  
  // タイトルの検証
  if (!record.title.value) {
    errors.push('タイトルは必須です');
  }
  
  if (record.title.value.length > 100) {
    errors.push('タイトルは100文字以内で入力してください');
  }
  
  // 優先度の検証
  if (!record.priority.value) {
    errors.push('優先度を選択してください');
  }
  
  if (errors.length > 0) {
    event.error = errors.join('\\n');
  }
  
  return event;
});`,
      usage: `
// 使用例: 複合的な検証ルール
function validateForm(form: HTMLFormElement): boolean {
  const validators = [
    validateRequired,
    validateLength,
    validateFormat,
    validateBusinessRules
  ];
  
  return validators.every(validator => validator(form));
}`
    },
    tags: ['validation', 'form-handling', 'intermediate'],
    difficulty: 'intermediate'
  },
  
  {
    name: '条件分岐表示パターン',
    description: 'レコードの状態に応じた画面表示の切り替え',
    category: 'conditional-display',
    webStandard: 'DOM manipulation',
    kintoneEquivalent: 'field visibility control',
    example: {
      web: `
document.addEventListener('change', (event) => {
  const target = event.target as HTMLSelectElement;
  
  if (target.name === 'status') {
    updateFieldVisibility(target.value);
  }
});

function updateFieldVisibility(status: string) {
  const completedFields = document.querySelectorAll('[data-show-when="completed"]');
  const inProgressFields = document.querySelectorAll('[data-show-when="in-progress"]');
  
  if (status === '完了') {
    completedFields.forEach(field => {
      (field as HTMLElement).style.display = 'block';
    });
    inProgressFields.forEach(field => {
      (field as HTMLElement).style.display = 'none';
    });
  } else if (status === '進行中') {
    completedFields.forEach(field => {
      (field as HTMLElement).style.display = 'none';
    });
    inProgressFields.forEach(field => {
      (field as HTMLElement).style.display = 'block';
    });
  }
}`,
      kintone: `
kintone.events.on('app.record.edit.change.status', (event) => {
  const status = event.changes.field.value;
  
  if (status === '完了') {
    kintone.app.record.setFieldShown('completed_date', true);
    kintone.app.record.setFieldShown('completion_notes', true);
    kintone.app.record.setFieldShown('progress_notes', false);
  } else if (status === '進行中') {
    kintone.app.record.setFieldShown('completed_date', false);
    kintone.app.record.setFieldShown('completion_notes', false);
    kintone.app.record.setFieldShown('progress_notes', true);
  }
  
  return event;
});`,
      usage: `
// 使用例: 権限に応じた表示制御
function updateFieldVisibility(userRole: string, recordStatus: string) {
  const adminFields = document.querySelectorAll('[data-role="admin"]');
  const editableFields = document.querySelectorAll('[data-editable="true"]');
  
  if (userRole !== 'admin') {
    adminFields.forEach(field => {
      (field as HTMLElement).style.display = 'none';
    });
  }
  
  if (recordStatus === '完了') {
    editableFields.forEach(field => {
      (field as HTMLInputElement).disabled = true;
    });
  }
}`
    },
    tags: ['conditional-display', 'field-control', 'intermediate'],
    difficulty: 'intermediate'
  }
];

/**
 * パターンを検索する
 */
export function findPatterns(options: {
  category?: string;
  tags?: string[];
  difficulty?: string;
  searchTerm?: string;
}): Pattern[] {
  let filtered = patterns;
  
  if (options.category) {
    filtered = filtered.filter(p => p.category === options.category);
  }
  
  if (options.tags && options.tags.length > 0) {
    filtered = filtered.filter(p => 
      options.tags!.some(tag => p.tags.includes(tag))
    );
  }
  
  if (options.difficulty) {
    filtered = filtered.filter(p => p.difficulty === options.difficulty);
  }
  
  if (options.searchTerm) {
    const term = options.searchTerm.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }
  
  return filtered;
}

/**
 * カテゴリ一覧を取得
 */
export function getCategories(): string[] {
  return [...new Set(patterns.map(p => p.category))];
}

/**
 * タグ一覧を取得
 */
export function getTags(): string[] {
  return [...new Set(patterns.flatMap(p => p.tags))];
}

/**
 * 難易度一覧を取得
 */
export function getDifficulties(): string[] {
  return ['beginner', 'intermediate', 'advanced'];
}

/**
 * パターンからコードを生成
 */
export function generateCode(pattern: Pattern, type: 'web' | 'kintone' = 'web'): string {
  return pattern.example[type];
}

/**
 * パターンの使用例を生成
 */
export function generateUsageExample(pattern: Pattern): string {
  return pattern.example.usage;
}

/**
 * パターンをMarkdown形式で出力
 */
export function formatPatternAsMarkdown(pattern: Pattern): string {
  return `
# ${pattern.name}

**カテゴリ**: ${pattern.category}  
**難易度**: ${pattern.difficulty}  
**タグ**: ${pattern.tags.join(', ')}

## 概要

${pattern.description}

## Web標準の書き方

\`\`\`typescript
${pattern.example.web}
\`\`\`

## kintoneの書き方

\`\`\`typescript
${pattern.example.kintone}
\`\`\`

## 使用例

\`\`\`typescript
${pattern.example.usage}
\`\`\`
`;
}

/**
 * 全パターンをMarkdown形式で出力
 */
export function generatePatternLibraryMarkdown(): string {
  const parts = [
    '# ktn-bridge パターンライブラリ',
    '',
    'kintone開発でよく使われるパターンをWeb標準の書き方で実装する方法を紹介します。',
    ''
  ];
  
  const categories = getCategories();
  
  categories.forEach(category => {
    const categoryPatterns = findPatterns({ category });
    
    parts.push(`## ${category}`);
    parts.push('');
    
    categoryPatterns.forEach(pattern => {
      parts.push(formatPatternAsMarkdown(pattern));
      parts.push('');
    });
  });
  
  return parts.join('\n');
}

export default {
  patterns,
  findPatterns,
  getCategories,
  getTags,
  getDifficulties,
  generateCode,
  generateUsageExample,
  formatPatternAsMarkdown,
  generatePatternLibraryMarkdown
};