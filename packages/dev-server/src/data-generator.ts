import type { KintoneRecord, KintoneFieldValue } from '@ktn-bridge/core';

export interface DataGeneratorOptions {
  recordCount?: number;
  appId?: string;
  locale?: string;
}

export class DataGenerator {
  private recordCount: number;
  private appId: string;
  private locale: string;

  constructor(options: DataGeneratorOptions = {}) {
    this.recordCount = options.recordCount || 10;
    this.appId = options.appId || '1';
    this.locale = options.locale || 'ja';
  }

  generateRecords(): KintoneRecord[] {
    const records: KintoneRecord[] = [];
    
    for (let i = 1; i <= this.recordCount; i++) {
      records.push(this.generateRecord(i));
    }

    return records;
  }

  generateRecord(id: number): KintoneRecord {
    return {
      $id: this.createFieldValue('RECORD_NUMBER', id.toString()),
      $revision: this.createFieldValue('REVISION', '1'),
      title: this.createFieldValue('SINGLE_LINE_TEXT', `サンプルレコード ${id}`),
      description: this.createFieldValue('MULTI_LINE_TEXT', this.generateDescription(id)),
      created_time: this.createFieldValue('CREATED_TIME', this.generateDateTime(-30, 0)),
      updated_time: this.createFieldValue('UPDATED_TIME', this.generateDateTime(-7, 0)),
      category: this.createFieldValue('DROP_DOWN', this.generateCategory()),
      priority: this.createFieldValue('NUMBER', this.generatePriority().toString()),
      status: this.createFieldValue('STATUS', this.generateStatus()),
      tags: this.createFieldValue('CHECK_BOX', this.generateTags()),
      assignee: this.createFieldValue('USER_SELECT', this.generateUser()),
      due_date: this.createFieldValue('DATE', this.generateDate(1, 90)),
      budget: this.createFieldValue('NUMBER', this.generateBudget().toString()),
      completed: this.createFieldValue('CHECK_BOX', this.generateCompleted()),
      notes: this.createFieldValue('RICH_TEXT', this.generateNotes(id))
    };
  }

  private createFieldValue(type: string, value: any): KintoneFieldValue {
    return {
      type,
      value
    };
  }

  private generateDescription(id: number): string {
    const templates = [
      'このレコードは開発用のサンプルデータです。',
      'テスト用のダミーデータとして生成されました。',
      'ktn-bridge開発環境でのテスト用レコードです。',
      'サンプルプロジェクトのデータとして作成されました。'
    ];
    
    return `${templates[id % templates.length]}\n\nレコードID: ${id}\n作成日時: ${new Date().toLocaleDateString('ja-JP')}`;
  }

  private generateDateTime(minDaysAgo: number, maxDaysAgo: number): string {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * (maxDaysAgo - minDaysAgo + 1)) + minDaysAgo;
    const targetDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    return targetDate.toISOString();
  }

  private generateDate(minDaysFromNow: number, maxDaysFromNow: number): string {
    const now = new Date();
    const daysFromNow = Math.floor(Math.random() * (maxDaysFromNow - minDaysFromNow + 1)) + minDaysFromNow;
    const targetDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
    
    return targetDate.toISOString().split('T')[0];
  }

  private generateCategory(): string {
    const categories = [
      'システム開発',
      'インフラ構築',
      'データ分析',
      'UI/UX改善',
      'セキュリティ',
      'テスト',
      'ドキュメント',
      '研修'
    ];
    
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private generatePriority(): number {
    const priorities = [1, 2, 3, 4, 5];
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  private generateStatus(): string {
    const statuses = [
      '未着手',
      '進行中',
      'レビュー待ち',
      'テスト中',
      '完了',
      '保留'
    ];
    
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private generateTags(): string[] {
    const allTags = [
      'フロントエンド',
      'バックエンド',
      'データベース',
      'API',
      'テスト',
      'ドキュメント',
      'セキュリティ',
      'パフォーマンス',
      'UI',
      'UX'
    ];
    
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = allTags.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private generateUser(): any {
    const users = [
      { code: 'user1', name: '田中 太郎' },
      { code: 'user2', name: '佐藤 花子' },
      { code: 'user3', name: '山田 次郎' },
      { code: 'user4', name: '鈴木 美咲' },
      { code: 'user5', name: '高橋 健太' }
    ];
    
    return users[Math.floor(Math.random() * users.length)];
  }

  private generateBudget(): number {
    const budgets = [50000, 100000, 200000, 500000, 1000000, 2000000];
    return budgets[Math.floor(Math.random() * budgets.length)];
  }

  private generateCompleted(): string[] {
    return Math.random() > 0.3 ? ['完了'] : [];
  }

  private generateNotes(id: number): string {
    const notes = [
      '<p>プロジェクトの進捗は順調です。</p>',
      '<p>いくつかの課題がありますが、解決策を検討中です。</p>',
      '<p>関係者との連携が重要になります。</p>',
      '<p>次回のミーティングで詳細を確認します。</p>',
      '<p>追加の要件について検討が必要です。</p>'
    ];
    
    return notes[id % notes.length];
  }

  generateApiResponse(endpoint: string, params: Record<string, any> = {}): any {
    switch (endpoint) {
      case '/k/v1/records':
        return {
          records: this.generateRecords(),
          totalCount: this.recordCount
        };
      
      case '/k/v1/record':
        const recordId = params.id || 1;
        return {
          record: this.generateRecord(recordId)
        };
      
      case '/k/v1/record/post':
        return {
          id: Math.floor(Math.random() * 1000) + 1000,
          revision: 1
        };
      
      case '/k/v1/record/put':
        return {
          revision: 2
        };
      
      case '/k/v1/records/delete':
        return {};
      
      default:
        return {
          error: 'Unknown endpoint'
        };
    }
  }
}

export const defaultDataGenerator = new DataGenerator();