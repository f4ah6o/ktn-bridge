import type { ApiMapping, KintoneApiRequest } from '../types';

export const apiMappings: Record<string, ApiMapping> = {
  'records.get': {
    kintoneApi: 'kintone.api',
    web: {
      method: 'fetch',
      description: 'レコード一覧取得API'
    },
    transform: {
      request: (req: Request): KintoneApiRequest => {
        const url = new URL(req.url);
        const app = url.searchParams.get('app');
        const query = url.searchParams.get('query');
        const fields = url.searchParams.get('fields');
        const totalCount = url.searchParams.get('totalCount');
        
        return {
          pathOrUrl: '/k/v1/records.json',
          method: 'GET',
          params: {
            app: app ? parseInt(app, 10) : undefined,
            query: query || undefined,
            fields: fields ? fields.split(',') : undefined,
            totalCount: totalCount === 'true'
          }
        };
      },
      response: (res: any): Response => new Response(JSON.stringify(res))
    },
    example: {
      web: `
// Web標準の書き方
const response = await fetch('/api/records?app=1&query=created_time > "2023-01-01"');
const data = await response.json();`,
      kintone: `
// kintoneの書き方
const response = await kintone.api('/k/v1/records', 'GET', {
  app: 1,
  query: 'created_time > "2023-01-01"'
});`
    }
  },
  
  'record.get': {
    kintoneApi: 'kintone.api',
    web: {
      method: 'fetch',
      description: 'レコード詳細取得API'
    },
    transform: {
      request: (req: Request): KintoneApiRequest => {
        const url = new URL(req.url);
        const app = url.searchParams.get('app');
        const id = url.searchParams.get('id');
        
        return {
          pathOrUrl: '/k/v1/record.json',
          method: 'GET',
          params: {
            app: app ? parseInt(app, 10) : undefined,
            id: id ? parseInt(id, 10) : undefined
          }
        };
      },
      response: (res: any): Response => new Response(JSON.stringify(res))
    },
    example: {
      web: `
// Web標準の書き方
const response = await fetch('/api/record?app=1&id=123');
const data = await response.json();`,
      kintone: `
// kintoneの書き方
const response = await kintone.api('/k/v1/record', 'GET', {
  app: 1,
  id: 123
});`
    }
  },
  
  'record.post': {
    kintoneApi: 'kintone.api',
    web: {
      method: 'fetch',
      description: 'レコード作成API'
    },
    transform: {
      request: (req: Request): KintoneApiRequest => {
        const url = new URL(req.url);
        const app = url.searchParams.get('app');
        
        return {
          pathOrUrl: '/k/v1/record.json',
          method: 'POST',
          params: {
            app: app ? parseInt(app, 10) : undefined,
            record: req.body
          }
        };
      },
      response: (res: any): Response => new Response(JSON.stringify(res))
    },
    example: {
      web: `
// Web標準の書き方
const response = await fetch('/api/record?app=1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: { value: 'New Record' },
    description: { value: 'Record description' }
  })
});`,
      kintone: `
// kintoneの書き方
const response = await kintone.api('/k/v1/record', 'POST', {
  app: 1,
  record: {
    title: { value: 'New Record' },
    description: { value: 'Record description' }
  }
});`
    }
  },
  
  'record.put': {
    kintoneApi: 'kintone.api',
    web: {
      method: 'fetch',
      description: 'レコード更新API'
    },
    transform: {
      request: (req: Request): KintoneApiRequest => {
        const url = new URL(req.url);
        const app = url.searchParams.get('app');
        const id = url.searchParams.get('id');
        
        return {
          pathOrUrl: '/k/v1/record.json',
          method: 'PUT',
          params: {
            app: app ? parseInt(app, 10) : undefined,
            id: id ? parseInt(id, 10) : undefined,
            record: req.body
          }
        };
      },
      response: (res: any): Response => new Response(JSON.stringify(res))
    },
    example: {
      web: `
// Web標準の書き方
const response = await fetch('/api/record?app=1&id=123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: { value: 'Updated Record' }
  })
});`,
      kintone: `
// kintoneの書き方
const response = await kintone.api('/k/v1/record', 'PUT', {
  app: 1,
  id: 123,
  record: {
    title: { value: 'Updated Record' }
  }
});`
    }
  },
  
  'record.delete': {
    kintoneApi: 'kintone.api',
    web: {
      method: 'fetch',
      description: 'レコード削除API'
    },
    transform: {
      request: (req: Request): KintoneApiRequest => {
        const url = new URL(req.url);
        const app = url.searchParams.get('app');
        const ids = url.searchParams.get('ids');
        
        return {
          pathOrUrl: '/k/v1/records.json',
          method: 'DELETE',
          params: {
            app: app ? parseInt(app, 10) : undefined,
            ids: ids ? ids.split(',').map(id => parseInt(id, 10)) : undefined
          }
        };
      },
      response: (res: any): Response => new Response(JSON.stringify(res))
    },
    example: {
      web: `
// Web標準の書き方
const response = await fetch('/api/record?app=1&ids=123,124', {
  method: 'DELETE'
});`,
      kintone: `
// kintoneの書き方
const response = await kintone.api('/k/v1/records', 'DELETE', {
  app: 1,
  ids: [123, 124]
});`
    }
  }
};

export function getApiMapping(apiName: string): ApiMapping | undefined {
  return apiMappings[apiName];
}

export function getAllApiMappings(): Record<string, ApiMapping> {
  return apiMappings;
}

export function getApiMappingByUrl(url: string): ApiMapping | undefined {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  
  // パスからAPIマッピングを特定
  if (pathname.includes('/api/records')) {
    return apiMappings['records.get'];
  } else if (pathname.includes('/api/record')) {
    return apiMappings['record.get'];
  }
  
  return undefined;
}