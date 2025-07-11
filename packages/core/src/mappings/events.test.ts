import { describe, it, expect } from 'vitest';
import { getEventMapping, getAllEventMappings } from './events';

describe('Event Mappings', () => {
  it('should get app.record.index.show mapping', () => {
    const mapping = getEventMapping('app.record.index.show');
    
    expect(mapping).toBeDefined();
    expect(mapping?.kintoneEvent).toBe('app.record.index.show');
    expect(mapping?.web.event).toBe('DOMContentLoaded');
  });
  
  it('should return undefined for unknown event', () => {
    const mapping = getEventMapping('unknown.event');
    
    expect(mapping).toBeUndefined();
  });
  
  it('should return all event mappings', () => {
    const mappings = getAllEventMappings();
    
    expect(mappings).toHaveProperty('app.record.index.show');
    expect(Object.keys(mappings).length).toBeGreaterThan(0);
  });
  
  it('should have valid transform functions', () => {
    const mapping = getEventMapping('app.record.index.show');
    
    expect(mapping?.transform.in).toBeInstanceOf(Function);
    expect(mapping?.transform.out).toBeInstanceOf(Function);
  });
});