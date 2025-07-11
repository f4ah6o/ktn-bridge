/**
 * ktn-bridge エラーハンドリング
 * 変換エラー、実行時エラー、開発時エラーを統一的に処理
 */

export enum ErrorType {
  TRANSFORM_ERROR = 'TRANSFORM_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  MAPPING_ERROR = 'MAPPING_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorContext {
  filename?: string;
  line?: number;
  column?: number;
  sourceCode?: string;
  transformedCode?: string;
  eventType?: string;
  apiEndpoint?: string;
  originalError?: Error;
  stack?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

export class KtnBridgeError extends Error {
  public readonly type: ErrorType;
  public readonly context: ErrorContext;
  public readonly isUserError: boolean;
  public readonly suggestions: string[];

  constructor(
    message: string,
    type: ErrorType,
    context: Partial<ErrorContext> = {},
    suggestions: string[] = []
  ) {
    super(message);
    this.name = 'KtnBridgeError';
    this.type = type;
    this.context = {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      ...context
    };
    this.isUserError = this.determineIfUserError(type);
    this.suggestions = suggestions;
  }

  private determineIfUserError(type: ErrorType): boolean {
    return [
      ErrorType.MAPPING_ERROR,
      ErrorType.VALIDATION_ERROR
    ].includes(type);
  }

  public toString(): string {
    const contextInfo = [];
    
    if (this.context.filename) {
      contextInfo.push(`File: ${this.context.filename}`);
    }
    
    if (this.context.line && this.context.column) {
      contextInfo.push(`Line: ${this.context.line}, Column: ${this.context.column}`);
    }
    
    if (this.context.eventType) {
      contextInfo.push(`Event: ${this.context.eventType}`);
    }
    
    if (this.context.apiEndpoint) {
      contextInfo.push(`API: ${this.context.apiEndpoint}`);
    }

    let result = `[${this.type}] ${this.message}`;
    
    if (contextInfo.length > 0) {
      result += `\n  Context: ${contextInfo.join(', ')}`;
    }
    
    if (this.suggestions.length > 0) {
      result += `\n  Suggestions:\n    ${this.suggestions.join('\n    ')}`;
    }
    
    return result;
  }

  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      context: this.context,
      isUserError: this.isUserError,
      suggestions: this.suggestions,
      stack: this.stack
    };
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: KtnBridgeError[] = [];
  private maxLogSize = 100;
  private onErrorCallback?: (error: KtnBridgeError) => void;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public setErrorCallback(callback: (error: KtnBridgeError) => void): void {
    this.onErrorCallback = callback;
  }

  public handleError(error: Error | KtnBridgeError, context?: Partial<ErrorContext>): KtnBridgeError {
    let ktnError: KtnBridgeError;

    if (error instanceof KtnBridgeError) {
      ktnError = error;
    } else {
      ktnError = this.createErrorFromGeneric(error, context);
    }

    this.logError(ktnError);
    
    if (this.onErrorCallback) {
      this.onErrorCallback(ktnError);
    }

    return ktnError;
  }

  private createErrorFromGeneric(error: Error, context?: Partial<ErrorContext>): KtnBridgeError {
    let errorType = ErrorType.UNKNOWN_ERROR;
    let suggestions: string[] = [];

    // エラーの種類を推定
    if (error.message.includes('fetch')) {
      errorType = ErrorType.NETWORK_ERROR;
      suggestions = [
        'ネットワーク接続を確認してください',
        'APIエンドポイントのURLが正しいか確認してください',
        '開発サーバーが起動しているか確認してください'
      ];
    } else if (error.message.includes('transform') || error.message.includes('AST')) {
      errorType = ErrorType.TRANSFORM_ERROR;
      suggestions = [
        'コードの構文を確認してください',
        'サポートされていないJavaScript機能を使用していないか確認してください',
        'TypeScriptの型定義が正しいか確認してください'
      ];
    } else if (error.message.includes('mapping') || error.message.includes('event')) {
      errorType = ErrorType.MAPPING_ERROR;
      suggestions = [
        'イベントマッピングが定義されているか確認してください',
        'サポートされているイベントタイプを使用しているか確認してください',
        'セレクターが正しいか確認してください'
      ];
    } else if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      errorType = ErrorType.RUNTIME_ERROR;
      suggestions = [
        '変数が正しく定義されているか確認してください',
        'オブジェクトのプロパティが存在するか確認してください',
        '関数が正しく呼び出されているか確認してください'
      ];
    }

    return new KtnBridgeError(
      error.message,
      errorType,
      {
        ...context,
        originalError: error,
        stack: error.stack
      },
      suggestions
    );
  }

  private logError(error: KtnBridgeError): void {
    this.errorLog.push(error);
    
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // 開発環境ではコンソールに出力
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.error(error.toString());
      
      if (error.context.sourceCode) {
        console.group('Source Code:');
        console.log(error.context.sourceCode);
        console.groupEnd();
      }
      
      if (error.context.transformedCode) {
        console.group('Transformed Code:');
        console.log(error.context.transformedCode);
        console.groupEnd();
      }
    }
  }

  public getErrorLog(): KtnBridgeError[] {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
  }

  public getErrorsByType(type: ErrorType): KtnBridgeError[] {
    return this.errorLog.filter(error => error.type === type);
  }

  public getUserErrors(): KtnBridgeError[] {
    return this.errorLog.filter(error => error.isUserError);
  }

  public getRecentErrors(count: number = 10): KtnBridgeError[] {
    return this.errorLog.slice(-count);
  }
}

// 便利な関数
export function createTransformError(
  message: string,
  filename: string,
  sourceCode: string,
  transformedCode?: string,
  line?: number,
  column?: number
): KtnBridgeError {
  return new KtnBridgeError(
    message,
    ErrorType.TRANSFORM_ERROR,
    {
      filename,
      sourceCode,
      transformedCode,
      line,
      column
    },
    [
      'コードの構文エラーを確認してください',
      'サポートされていない機能を使用していないか確認してください',
      'TypeScriptの型定義を確認してください'
    ]
  );
}

export function createMappingError(
  message: string,
  eventType: string,
  suggestions: string[] = []
): KtnBridgeError {
  return new KtnBridgeError(
    message,
    ErrorType.MAPPING_ERROR,
    { eventType },
    suggestions.length > 0 ? suggestions : [
      'イベントマッピングが定義されているか確認してください',
      'サポートされているイベントタイプを使用してください',
      'セレクターが正しいか確認してください'
    ]
  );
}

export function createNetworkError(
  message: string,
  apiEndpoint: string,
  originalError?: Error
): KtnBridgeError {
  return new KtnBridgeError(
    message,
    ErrorType.NETWORK_ERROR,
    {
      apiEndpoint,
      originalError
    },
    [
      'ネットワーク接続を確認してください',
      'APIエンドポイントのURLが正しいか確認してください',
      '開発サーバーが起動しているか確認してください'
    ]
  );
}

export function createValidationError(
  message: string,
  context: Partial<ErrorContext> = {}
): KtnBridgeError {
  return new KtnBridgeError(
    message,
    ErrorType.VALIDATION_ERROR,
    context,
    [
      'パラメータの型や値を確認してください',
      '必須フィールドが入力されているか確認してください',
      'データの形式が正しいか確認してください'
    ]
  );
}

// グローバルエラーハンドラーの設定
export function setupGlobalErrorHandler(): void {
  const errorHandler = ErrorHandler.getInstance();

  // 未処理のエラーをキャッチ
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      errorHandler.handleError(event.error, {
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      errorHandler.handleError(new Error(event.reason), {
        filename: 'Promise rejection'
      });
    });
  }

  // Node.js環境
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error: Error) => {
      errorHandler.handleError(error);
    });

    process.on('unhandledRejection', (reason: any) => {
      errorHandler.handleError(new Error(String(reason)));
    });
  }
}

export default ErrorHandler;