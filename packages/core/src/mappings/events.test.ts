import { describe, it, expect } from 'vitest';
import { getEventMapping, getAllEventMappings } from './events';

describe('Event Mappings', () => {
  it('should get app.record.index.show mapping', () => {
    const mapping = getEventMapping('app.record.index.show');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneEvent).toBe('app.record.index.show');
    expect(mapping?.web.event).toBe('DOMContentLoaded');
  });
  
  it('should get app.record.detail.show mapping', () => {
    const mapping = getEventMapping('app.record.detail.show');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneEvent).toBe('app.record.detail.show');
    expect(mapping?.web.event).toBe('DOMContentLoaded');
    expect(mapping?.web.selector).toBe('[data-page="record-detail"]');
  });
  
  it('should get app.record.create.show mapping', () => {
    const mapping = getEventMapping('app.record.create.show');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneEvent).toBe('app.record.create.show');
    expect(mapping?.web.event).toBe('DOMContentLoaded');
    expect(mapping?.web.selector).toBe('[data-page="record-create"]');
  });
  
  it('should get app.record.edit.show mapping', () => {
    const mapping = getEventMapping('app.record.edit.show');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneEvent).toBe('app.record.edit.show');
    expect(mapping?.web.event).toBe('DOMContentLoaded');
    expect(mapping?.web.selector).toBe('[data-page="record-edit"]');
  });
  
  it('should get app.record.create.submit mapping', () => {
    const mapping = getEventMapping('app.record.create.submit');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneEvent).toBe('app.record.create.submit');
    expect(mapping?.web.event).toBe('submit');
    expect(mapping?.web.selector).toBe('[data-form="record-create"]');
  });
  
  it('should get app.record.edit.submit mapping', () => {
    const mapping = getEventMapping('app.record.edit.submit');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneEvent).toBe('app.record.edit.submit');
    expect(mapping?.web.event).toBe('submit');
    expect(mapping?.web.selector).toBe('[data-form="record-edit"]');
  });
  
  it('should return undefined for unknown event', () => {
    const mapping = getEventMapping('unknown.event');
    
    expect(mapping).toBeUndefined();
  });
  
  it('should return all event mappings', () => {
    const mappings = getAllEventMappings();
    
    expect(mappings).toHaveProperty('app.record.index.show');
    expect(mappings).toHaveProperty('app.record.detail.show');
    expect(mappings).toHaveProperty('app.record.create.show');
    expect(mappings).toHaveProperty('app.record.edit.show');
    expect(mappings).toHaveProperty('app.record.create.submit');
    expect(mappings).toHaveProperty('app.record.edit.submit');
    expect(Object.keys(mappings).length).toBe(6);
  });
  
  it('should have valid transform functions', () => {
    const mapping = getEventMapping('app.record.index.show');
    
    expect(mapping?.transform.in).toBeInstanceOf(Function);
    expect(mapping?.transform.out).toBeInstanceOf(Function);
  });
  
  it('should transform web events to kintone events', () => {
    const mapping = getEventMapping('app.record.detail.show');
    
    const webEvent = new CustomEvent('test', {
      detail: {
        record: { title: { value: 'Test' } },
        recordId: '123',
        appId: '456'
      }
    });
    
    const kintoneEvent = mapping?.transform.in(webEvent);
    
    expect(kintoneEvent).toBeDefined();
    expect(kintoneEvent?.type).toBe('app.record.detail.show');
    expect(kintoneEvent?.recordId).toBe('123');
    expect(kintoneEvent?.appId).toBe('456');
  });
  
  it('should transform kintone events to web events', () => {
    const mapping = getEventMapping('app.record.create.submit');
    
    const kintoneEvent = {
      type: 'app.record.create.submit',
      record: { title: { value: 'Test' } },
      appId: '456'
    };
    
    const webEvent = mapping?.transform.out(kintoneEvent);
    
    expect(webEvent).toBeDefined();
    expect(webEvent?.type).toBe('formsubmit');
    expect(webEvent?.detail?.record).toEqual({ title: { value: 'Test' } });
    expect(webEvent?.detail?.appId).toBe('456');
  });
});