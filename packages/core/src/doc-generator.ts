/**
 * ドキュメント自動生成
 * イベントマッピング、APIマッピング、パターンライブラリから
 * 各種ドキュメントを自動生成する
 */

import { eventMappings } from './mappings/events';
import { apiMappings } from './mappings/apis';
import { generatePatternLibraryMarkdown } from './patterns';
import { generateEventTypes, generateApiTypes } from './type-generator';
import type { EventMapping, ApiMapping } from './types';

export interface DocGeneratorOptions {
  includeExamples?: boolean;
  includeTypes?: boolean;
  includePatterns?: boolean;
  format?: 'markdown' | 'html' | 'json';
  outputPath?: string;
  language?: 'ja' | 'en';
}

export class DocGenerator {
  private options: DocGeneratorOptions;

  constructor(options: DocGeneratorOptions = {}) {
    this.options = {
      includeExamples: true,
      includeTypes: true,
      includePatterns: true,
      format: 'markdown',
      language: 'ja',
      ...options
    };
  }

  /**
   * 全ドキュメントを生成
   */
  public generateAllDocs(): string {
    const sections: string[] = [];

    // ヘッダー
    sections.push(this.generateHeader());

    // 概要
    sections.push(this.generateOverview());

    // クイックスタート
    sections.push(this.generateQuickStart());

    // イベントマッピング
    sections.push(this.generateEventMappingDocs());

    // APIマッピング
    sections.push(this.generateApiMappingDocs());

    // パターンライブラリ
    if (this.options.includePatterns) {
      sections.push(this.generatePatternDocs());
    }

    // 型定義
    if (this.options.includeTypes) {
      sections.push(this.generateTypeDocs());
    }

    // トラブルシューティング
    sections.push(this.generateTroubleshootingDocs());

    // FAQ
    sections.push(this.generateFAQDocs());

    return sections.join('\n\n');
  }

  /**
   * イベントマッピングドキュメントを生成
   */
  public generateEventMappingDocs(): string {
    const sections: string[] = [];

    sections.push('# イベントマッピング');
    sections.push('');
    sections.push('Web標準のイベントとkintoneイベントのマッピング一覧です。');
    sections.push('');

    // 対応表
    sections.push('## 対応表');
    sections.push('');
    sections.push('| Web標準イベント | kintoneイベント | 説明 |');
    sections.push('|:---|:---|:---|');

    Object.entries(eventMappings).forEach(([kintoneEvent, mapping]) => {
      sections.push(`| ${mapping.web.event} | ${kintoneEvent} | ${mapping.web.description} |`);
    });

    sections.push('');

    // 詳細
    sections.push('## 詳細');
    sections.push('');

    Object.entries(eventMappings).forEach(([kintoneEvent, mapping]) => {
      sections.push(this.generateEventMappingDetail(kintoneEvent, mapping));
      sections.push('');
    });

    return sections.join('\n');
  }

  /**
   * APIマッピングドキュメントを生成
   */
  public generateApiMappingDocs(): string {
    const sections: string[] = [];

    sections.push('# APIマッピング');
    sections.push('');
    sections.push('Web標準のAPIとkintone APIのマッピング一覧です。');
    sections.push('');

    // 対応表
    sections.push('## 対応表');
    sections.push('');
    sections.push('| Web標準API | kintone API | 説明 |');
    sections.push('|:---|:---|:---|');

    Object.entries(apiMappings).forEach(([kintoneApi, mapping]) => {
      sections.push(`| ${mapping.web.method} | ${kintoneApi} | ${mapping.web.description} |`);
    });

    sections.push('');

    // 詳細
    sections.push('## 詳細');
    sections.push('');

    Object.entries(apiMappings).forEach(([kintoneApi, mapping]) => {
      sections.push(this.generateApiMappingDetail(kintoneApi, mapping));
      sections.push('');
    });

    return sections.join('\n');
  }

  /**
   * パターンライブラリドキュメントを生成
   */
  public generatePatternDocs(): string {
    return generatePatternLibraryMarkdown();
  }

  /**
   * 型定義ドキュメントを生成
   */
  public generateTypeDocs(): string {
    const sections: string[] = [];

    sections.push('# 型定義');
    sections.push('');
    sections.push('ktn-bridgeで使用される型定義です。');
    sections.push('');

    // イベント型
    sections.push('## イベント型');
    sections.push('');
    sections.push('```typescript');
    sections.push(generateEventTypes());
    sections.push('```');
    sections.push('');

    // API型
    sections.push('## API型');
    sections.push('');
    sections.push('```typescript');
    sections.push(generateApiTypes());
    sections.push('```');
    sections.push('');

    return sections.join('\n');
  }

  /**
   * トラブルシューティングドキュメントを生成
   */
  public generateTroubleshootingDocs(): string {
    return `
# トラブルシューティング

## よくある問題

### 1. イベントが発火しない

**症状**: Web標準のイベントリスナーが動作しない

**原因**: 
- セレクターが正しくない
- イベントマッピングが定義されていない
- 変換が正しく行われていない

**解決方法**:
\`\`\`typescript
// セレクターを確認
document.addEventListener('DOMContentLoaded', (event) => {
  const page = document.querySelector('[data-page="record-list"]');
  if (page) {
    // 正しいセレクターで要素が取得できるか確認
    console.log('Page found:', page);
  }
});
\`\`\`

### 2. fetch APIが動作しない

**症状**: fetch APIでのデータ取得が失敗する

**原因**:
- APIエンドポイントが正しくない
- 開発サーバーが起動していない
- CORS設定の問題

**解決方法**:
\`\`\`typescript
// エラーハンドリングを追加
try {
  const response = await fetch('/api/records');
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  const data = await response.json();
  console.log('Data:', data);
} catch (error) {
  console.error('Fetch error:', error);
}
\`\`\`

### 3. 型エラーが発生する

**症状**: TypeScriptの型エラーが発生する

**原因**:
- 型定義が正しくない
- 必要な型定義がインポートされていない

**解決方法**:
\`\`\`typescript
// 正しい型定義をインポート
import type { KintoneRecord, KintoneFieldValue } from '@ktn-bridge/core';

// 型アサーションを使用
const target = event.target as HTMLInputElement;
\`\`\`

### 4. 開発サーバーが起動しない

**症状**: \`pnpm dev\`でサーバーが起動しない

**原因**:
- 依存関係のインストール不足
- ポート番号の競合
- 設定ファイルのエラー

**解決方法**:
\`\`\`bash
# 依存関係を再インストール
pnpm install

# 別のポートで起動
pnpm dev --port 3001

# 設定ファイルを確認
cat vite.config.ts
\`\`\`

## エラーメッセージ別対処法

### "Transform failed"

コードの変換に失敗しています。

- TypeScriptの構文エラーを確認
- サポートされていない機能を使用していないか確認
- ソースコードの文字コードを確認

### "Mapping not found"

イベントマッピングが見つかりません。

- 使用しているイベントタイプが対応しているか確認
- セレクターが正しいか確認
- 最新バージョンのktn-bridgeを使用しているか確認

### "Network error"

ネットワークエラーが発生しています。

- 開発サーバーが起動しているか確認
- APIエンドポイントのURLが正しいか確認
- ブラウザのネットワークタブでリクエストを確認

## デバッグ方法

### 1. ブラウザの開発者ツールを使用

\`\`\`typescript
// コンソールでデバッグ情報を出力
console.log('Debug info:', {
  event: event.type,
  target: event.target,
  data: event.detail
});
\`\`\`

### 2. 変換結果を確認

\`\`\`bash
# ビルドして変換結果を確認
pnpm build
cat dist/customize.js
\`\`\`

### 3. エラーログを確認

\`\`\`typescript
// エラーハンドリングを追加
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
\`\`\`
`;
  }

  /**
   * FAQドキュメントを生成
   */
  public generateFAQDocs(): string {
    return `
# FAQ

## Q: ktn-bridgeとは何ですか？

A: ktn-bridgeは、kintoneカスタマイズ開発をWeb標準の方法で行えるようにするフレームワークです。通常のJavaScript/TypeScriptでコードを書き、ビルド時にkintone専用のコードに自動変換します。

## Q: どのような環境で使用できますか？

A: 以下の環境で使用できます：
- Node.js 18以上
- pnpm 8以上
- TypeScript 5以上
- Vite 5以上

## Q: 既存のkintoneカスタマイズから移行できますか？

A: はい、段階的に移行できます。既存のkintoneカスタマイズと併用しながら、新しい機能をktn-bridgeで実装することができます。

## Q: どのようなイベントがサポートされていますか？

A: 以下のイベントがサポートされています：
- レコード一覧表示: \`DOMContentLoaded\`
- レコード詳細表示: \`DOMContentLoaded\`
- フィールド変更: \`change\`
- フォーム送信: \`submit\`
- ページ離脱: \`beforeunload\`
- カスタムイベント: \`CustomEvent\`

## Q: APIの呼び出し方法は？

A: 通常のfetch APIを使用します：

\`\`\`typescript
// Web標準の書き方
const response = await fetch('/api/records?app=1');
const data = await response.json();

// 自動的にkintone.apiに変換される
const response = await kintone.api('/k/v1/records', 'GET', {app: 1});
\`\`\`

## Q: エラーが発生した場合の対処法は？

A: 以下の手順で確認してください：
1. ブラウザの開発者ツールでエラーメッセージを確認
2. コンソールでデバッグ情報を確認
3. 変換結果を確認
4. トラブルシューティングガイドを参照

## Q: 型定義は自動生成されますか？

A: はい、イベントマッピングとAPIマッピングから自動的に型定義が生成されます。

## Q: カスタムイベントは使用できますか？

A: はい、CustomEventを使用してカスタムイベントを定義できます。

## Q: パフォーマンスに影響はありますか？

A: 変換は開発時に行われるため、本番環境でのパフォーマンスに影響はありません。

## Q: 複数のアプリで共通のコードを使用できますか？

A: はい、共通のパターンライブラリを作成して複数のアプリで再利用できます。

## Q: VS Codeでの開発サポートはありますか？

A: TypeScriptの型定義により、VS Codeでの自動補完やエラーチェックが利用できます。将来的にはVS Code拡張機能も提供予定です。
`;
  }

  private generateHeader(): string {
    return `
# ktn-bridge ドキュメント

**バージョン**: 0.1.0  
**最終更新**: ${new Date().toISOString().split('T')[0]}  
**言語**: ${this.options.language}

kintoneカスタマイズ開発をWeb標準の方法で行うためのフレームワークです。
`;
  }

  private generateOverview(): string {
    return `
# 概要

ktn-bridgeは、kintoneカスタマイズ開発を「普通のWeb開発」として行えるようにするフレームワークです。

## 特徴

- **Web標準**: 通常のJavaScript/TypeScriptでコードを記述
- **自動変換**: ビルド時にkintone専用コードに自動変換
- **型安全**: TypeScriptの型定義で開発を支援
- **開発体験**: Viteベースの高速な開発サーバー

## コンセプト

- **開発時**: Web標準のコードで記述
- **ビルド時**: kintone用コードに自動変換
- **本番時**: 通常のkintoneカスタマイズとして動作
`;
  }

  private generateQuickStart(): string {
    return `
# クイックスタート

## インストール

\`\`\`bash
# プロジェクトを作成
pnpm create ktn-bridge my-app

# ディレクトリに移動
cd my-app

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev
\`\`\`

## 基本的な使い方

\`\`\`typescript
// src/index.ts
document.addEventListener('DOMContentLoaded', (event) => {
  const page = document.querySelector('[data-page="record-list"]');
  
  if (page) {
    console.log('レコード一覧が表示されました');
  }
});
\`\`\`

## ビルド

\`\`\`bash
# プロダクション用にビルド
pnpm build

# 生成されたファイルを確認
ls dist/
\`\`\`
`;
  }

  private generateEventMappingDetail(kintoneEvent: string, mapping: EventMapping): string {
    const sections: string[] = [];

    sections.push(`### ${kintoneEvent}`);
    sections.push('');
    sections.push(`**説明**: ${mapping.web.description}`);
    sections.push(`**Web標準イベント**: ${mapping.web.event}`);
    
    if (mapping.web.selector) {
      sections.push(`**セレクター**: ${mapping.web.selector}`);
    }
    
    if (mapping.since) {
      sections.push(`**対応バージョン**: ${mapping.since}`);
    }
    
    if (mapping.deprecated) {
      sections.push(`**非推奨**: このイベントは非推奨です`);
    }

    sections.push('');

    if (this.options.includeExamples) {
      sections.push('**Web標準の書き方**:');
      sections.push('```typescript');
      sections.push(mapping.example.web.trim());
      sections.push('```');
      sections.push('');

      sections.push('**kintoneの書き方**:');
      sections.push('```typescript');
      sections.push(mapping.example.kintone.trim());
      sections.push('```');
      sections.push('');
    }

    return sections.join('\n');
  }

  private generateApiMappingDetail(kintoneApi: string, mapping: ApiMapping): string {
    const sections: string[] = [];

    sections.push(`### ${kintoneApi}`);
    sections.push('');
    sections.push(`**説明**: ${mapping.web.description}`);
    sections.push(`**Web標準メソッド**: ${mapping.web.method}`);
    sections.push('');

    if (this.options.includeExamples) {
      sections.push('**Web標準の書き方**:');
      sections.push('```typescript');
      sections.push(mapping.example.web.trim());
      sections.push('```');
      sections.push('');

      sections.push('**kintoneの書き方**:');
      sections.push('```typescript');
      sections.push(mapping.example.kintone.trim());
      sections.push('```');
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * README.mdを生成
   */
  public generateReadme(): string {
    return `
# ktn-bridge

kintoneカスタマイズ開発をWeb標準の方法で行うためのフレームワークです。

## インストール

\`\`\`bash
pnpm create ktn-bridge my-app
cd my-app
pnpm install
pnpm dev
\`\`\`

## 使用方法

詳細な使用方法は[ドキュメント](./docs/)を参照してください。

## サポート

- [GitHub Issues](https://github.com/your-org/ktn-bridge/issues)
- [Discord](https://discord.gg/your-invite)

## ライセンス

MIT License
`;
  }
}

/**
 * 便利関数
 */
export function generateAllDocs(options?: DocGeneratorOptions): string {
  const generator = new DocGenerator(options);
  return generator.generateAllDocs();
}

export function generateEventMappingDocs(options?: DocGeneratorOptions): string {
  const generator = new DocGenerator(options);
  return generator.generateEventMappingDocs();
}

export function generateApiMappingDocs(options?: DocGeneratorOptions): string {
  const generator = new DocGenerator(options);
  return generator.generateApiMappingDocs();
}

export function generatePatternDocs(options?: DocGeneratorOptions): string {
  const generator = new DocGenerator(options);
  return generator.generatePatternDocs();
}

export function generateReadme(options?: DocGeneratorOptions): string {
  const generator = new DocGenerator(options);
  return generator.generateReadme();
}

export default DocGenerator;