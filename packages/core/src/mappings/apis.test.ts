import { describe, it, expect } from 'vitest';
import { getApiMapping, getAllApiMappings, getApiMappingByUrl } from './apis';

describe('API Mappings', () => {
  it('should get records.get mapping', () => {
    const mapping = getApiMapping('records.get');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneApi).toBe('kintone.api');
    expect(mapping?.web.method).toBe('fetch');
    expect(mapping?.web.description).toBe('レコード一覧取得API');
  });
  
  it('should get record.get mapping', () => {
    const mapping = getApiMapping('record.get');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneApi).toBe('kintone.api');
    expect(mapping?.web.method).toBe('fetch');
    expect(mapping?.web.description).toBe('レコード詳細取得API');
  });
  
  it('should get record.post mapping', () => {
    const mapping = getApiMapping('record.post');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneApi).toBe('kintone.api');
    expect(mapping?.web.method).toBe('fetch');
    expect(mapping?.web.description).toBe('レコード作成API');
  });
  
  it('should get record.put mapping', () => {
    const mapping = getApiMapping('record.put');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneApi).toBe('kintone.api');
    expect(mapping?.web.method).toBe('fetch');
    expect(mapping?.web.description).toBe('レコード更新API');
  });
  
  it('should get record.delete mapping', () => {
    const mapping = getApiMapping('record.delete');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneApi).toBe('kintone.api');
    expect(mapping?.web.method).toBe('fetch');
    expect(mapping?.web.description).toBe('レコード削除API');
  });
  
  it('should return undefined for unknown API', () => {
    const mapping = getApiMapping('unknown.api');
    
    expect(mapping).toBeUndefined();
  });
  
  it('should return all API mappings', () => {
    const mappings = getAllApiMappings();
    
    expect(mappings).toHaveProperty('records.get');
    expect(mappings).toHaveProperty('record.get');
    expect(mappings).toHaveProperty('record.post');
    expect(mappings).toHaveProperty('record.put');
    expect(mappings).toHaveProperty('record.delete');
    expect(Object.keys(mappings).length).toBe(5);
  });
  
  it('should get API mapping by URL', () => {
    const mapping = getApiMappingByUrl('https://example.com/api/records?app=1');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneApi).toBe('kintone.api');
    expect(mapping?.web.description).toBe('レコード一覧取得API');
  });
  
  it('should return undefined for unknown URL', () => {
    const mapping = getApiMappingByUrl('https://example.com/unknown');
    
    expect(mapping).toBeUndefined();
  });
  
  it('should transform fetch request to kintone API request', () => {
    const mapping = getApiMapping('records.get');
    
    const mockRequest = {
      url: 'https://example.com/api/records?app=1&query=created_time%20%3E%20%222023-01-01%22&fields=title,description&totalCount=true',
      method: 'GET',
      body: null
    } as Request;
    
    const kintoneRequest = mapping?.transform.request(mockRequest);
    
    expect(kintoneRequest).toBeDefined();
    expect(kintoneRequest?.pathOrUrl).toBe('/k/v1/records.json');
    expect(kintoneRequest?.method).toBe('GET');
    expect(kintoneRequest?.params?.app).toBe(1);
    expect(kintoneRequest?.params?.query).toBe('created_time > "2023-01-01"');
    expect(kintoneRequest?.params?.fields).toEqual(['title', 'description']);
    expect(kintoneRequest?.params?.totalCount).toBe(true);
  });
  
  it('should transform kintone API response to web response', () => {
    const mapping = getApiMapping('record.get');
    
    const kintoneResponse = {
      record: {
        title: { value: 'Test Record' },
        description: { value: 'Test Description' }
      }
    };
    
    const webResponse = mapping?.transform.response(kintoneResponse);
    
    expect(webResponse).toBeDefined();
    expect(webResponse).toBeInstanceOf(Response);
  });
  
  it('should handle record POST request transformation', () => {
    const mapping = getApiMapping('record.post');
    
    const mockRequest = {
      url: 'https://example.com/api/record?app=1',
      method: 'POST',
      body: {
        title: { value: 'New Record' },
        description: { value: 'New Description' }
      }
    } as Request;
    
    const kintoneRequest = mapping?.transform.request(mockRequest);
    
    expect(kintoneRequest).toBeDefined();
    expect(kintoneRequest?.pathOrUrl).toBe('/k/v1/record.json');
    expect(kintoneRequest?.method).toBe('POST');
    expect(kintoneRequest?.params?.app).toBe(1);
    expect(kintoneRequest?.params?.record).toEqual({
      title: { value: 'New Record' },
      description: { value: 'New Description' }
    });
  });
  
  it('should handle record PUT request transformation', () => {
    const mapping = getApiMapping('record.put');
    
    const mockRequest = {
      url: 'https://example.com/api/record?app=1&id=123',
      method: 'PUT',
      body: {
        title: { value: 'Updated Record' }
      }
    } as Request;
    
    const kintoneRequest = mapping?.transform.request(mockRequest);
    
    expect(kintoneRequest).toBeDefined();
    expect(kintoneRequest?.pathOrUrl).toBe('/k/v1/record.json');
    expect(kintoneRequest?.method).toBe('PUT');
    expect(kintoneRequest?.params?.app).toBe(1);
    expect(kintoneRequest?.params?.id).toBe(123);
    expect(kintoneRequest?.params?.record).toEqual({
      title: { value: 'Updated Record' }
    });
  });
  
  it('should handle record DELETE request transformation', () => {
    const mapping = getApiMapping('record.delete');
    
    const mockRequest = {
      url: 'https://example.com/api/record?app=1&ids=123,124,125',
      method: 'DELETE',
      body: null
    } as Request;
    
    const kintoneRequest = mapping?.transform.request(mockRequest);
    
    expect(kintoneRequest).toBeDefined();
    expect(kintoneRequest?.pathOrUrl).toBe('/k/v1/records.json');
    expect(kintoneRequest?.method).toBe('DELETE');
    expect(kintoneRequest?.params?.app).toBe(1);
    expect(kintoneRequest?.params?.ids).toEqual([123, 124, 125]);
  });
});