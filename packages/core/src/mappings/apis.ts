import type { ApiMapping, KintoneApiRequest } from '../types';

export const apiMappings: Record<string, ApiMapping> = {
  'kintone.api': {
    kintoneApi: 'kintone.api',
    web: {
      method: 'fetch',
      description: 'REST API呼び出し'
    },
    transform: {
      request: (req: Request): KintoneApiRequest => ({
        pathOrUrl: req.url,
        method: req.method,
        params: req.body
      }),
      response: (res: any): Response => new Response(JSON.stringify(res))
    },
    example: {
      web: `
// Web標準の書き方
const response = await fetch('/api/records?app=1');
const data = await response.json();`,
      kintone: `
// kintoneの書き方
const response = await kintone.api('/k/v1/records', 'GET', {app: 1});`
    }
  }
};

export function getApiMapping(apiName: string): ApiMapping | undefined {
  return apiMappings[apiName];
}

export function getAllApiMappings(): Record<string, ApiMapping> {
  return apiMappings;
}