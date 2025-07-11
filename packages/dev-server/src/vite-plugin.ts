import type { Plugin } from 'vite';
import { KintoneTransformer } from '@ktn-bridge/core';

export interface KintoneBridgeOptions {
  target?: 'development' | 'production';
  sourceMap?: boolean;
}

export function kintoneBridge(options: KintoneBridgeOptions = {}): Plugin {
  const { target = 'development', sourceMap = true } = options;
  const transformer = new KintoneTransformer();
  
  return {
    name: 'kintone-bridge',
    transform(code, id) {
      if (id.endsWith('.ts') || id.endsWith('.js')) {
        try {
          const result = transformer.transform(code, {
            filename: id,
            target,
            sourceMap
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
    
    configureServer(server) {
      server.middlewares.use('/api', (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (req.method === 'OPTIONS') {
          res.end();
          return;
        }
        
        if (req.url?.startsWith('/api/records')) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            records: [
              {
                title: { type: 'SINGLE_LINE_TEXT', value: 'Sample Record 1' },
                $id: { type: 'RECORD_NUMBER', value: '1' }
              },
              {
                title: { type: 'SINGLE_LINE_TEXT', value: 'Sample Record 2' },
                $id: { type: 'RECORD_NUMBER', value: '2' }
              }
            ]
          }));
          return;
        }
        
        next();
      });
    }
  };
}