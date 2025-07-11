import type { Plugin } from 'vite';
// import { KintoneTransformer } from '@ktn-bridge/core';

// Temporary until build issue is resolved
class KintoneTransformer {
  transform(code: string, _options: any): any {
    // Mock implementation
    return { code, map: null, dependencies: [] };
  }
}
import { globalCache, DataCache } from './cache';
import { defaultDataGenerator, DataGenerator } from './data-generator';

export interface KintoneBridgeOptions {
  target?: 'development' | 'production';
  sourceMap?: boolean;
  cache?: {
    ttl?: number;
    maxSize?: number;
  };
  dataGenerator?: {
    recordCount?: number;
    appId?: string;
    locale?: string;
  };
}

export function kintoneBridge(options: KintoneBridgeOptions = {}): Plugin {
  const { target = 'development', sourceMap = true, cache: cacheOptions, dataGenerator: dataGenOptions } = options;
  const transformer = new KintoneTransformer();
  const cache = cacheOptions ? new DataCache(cacheOptions) : globalCache;
  const dataGenerator = dataGenOptions ? new DataGenerator(dataGenOptions) : defaultDataGenerator;
  
  // ホットリロード用の変換キャッシュ
  const transformCache = new Map<string, { code: string; map?: string; timestamp: number }>();
  
  return {
    name: 'kintone-bridge',
    buildStart() {
      // ビルド開始時にキャッシュをクリア
      transformCache.clear();
    },
    transform(code, id) {
      if (id.endsWith('.ts') || id.endsWith('.js')) {
        try {
          // ホットリロード用の変更検出
          const currentTimestamp = Date.now();
          const cached = transformCache.get(id);
          
          if (cached && cached.timestamp > currentTimestamp - 1000) {
            // 1秒以内の変更は変換をスキップ
            return {
              code: cached.code,
              map: cached.map
            };
          }
          
          const result = transformer.transform(code, {
            filename: id,
            target,
            sourceMap
          });
          
          // 変換結果をキャッシュ
          transformCache.set(id, {
            code: result.code,
            map: result.map,
            timestamp: currentTimestamp
          });
          
          return {
            code: result.code,
            map: result.map
          };
        } catch (error) {
          console.warn(`Transform failed for ${id}: ${error instanceof Error ? error.message : String(error)}`);
          return null;
        }
      }
      return null;
    },
    handleHotUpdate(ctx) {
      // ホットリロード時の処理
      const { file } = ctx;
      
      // 変換キャッシュから古いエントリを削除
      if (transformCache.has(file)) {
        transformCache.delete(file);
      }
      
      // kintone関連ファイルの変更を検出
      if (file.includes('kintone') || file.includes('ktn-bridge')) {
        console.log(`[ktn-bridge] Hot reloading: ${file}`);
        
        // 関連ファイルのキャッシュもクリア
        for (const [key] of transformCache) {
          if (key.includes('kintone') || key.includes('ktn-bridge')) {
            transformCache.delete(key);
          }
        }
      }
      
      // デフォルトのホットリロード処理を続行
      return undefined;
    },
    
    configureServer(server) {
      server.middlewares.use('/api', (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (req.method === 'OPTIONS') {
          res.end();
          return;
        }
        
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const cacheKey = DataCache.generateKey(url.pathname, Object.fromEntries(url.searchParams));
        
        // キャッシュから確認
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Cache', 'HIT');
          res.end(JSON.stringify(cachedData));
          return;
        }
        
        let responseData: any = null;
        
        if (req.url?.startsWith('/api/records')) {
          responseData = dataGenerator.generateApiResponse('/k/v1/records', {
            app: url.searchParams.get('app'),
            query: url.searchParams.get('query'),
            fields: url.searchParams.get('fields'),
            totalCount: url.searchParams.get('totalCount')
          });
        } else if (req.url?.startsWith('/api/record')) {
          const id = url.searchParams.get('id');
          
          if (req.method === 'GET') {
            responseData = dataGenerator.generateApiResponse('/k/v1/record', {
              app: url.searchParams.get('app'),
              id: id ? parseInt(id, 10) : undefined
            });
          } else if (req.method === 'POST') {
            responseData = dataGenerator.generateApiResponse('/k/v1/record/post', {
              app: url.searchParams.get('app')
            });
          } else if (req.method === 'PUT') {
            responseData = dataGenerator.generateApiResponse('/k/v1/record/put', {
              app: url.searchParams.get('app'),
              id: id ? parseInt(id, 10) : undefined
            });
          } else if (req.method === 'DELETE') {
            responseData = dataGenerator.generateApiResponse('/k/v1/records/delete', {
              app: url.searchParams.get('app'),
              ids: url.searchParams.get('ids')
            });
          }
        }
        
        if (responseData) {
          // キャッシュに保存
          cache.set(cacheKey, responseData, 60000); // 1分間キャッシュ
          
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Cache', 'MISS');
          res.end(JSON.stringify(responseData));
          return;
        }
        
        next();
      });
    }
  };
}