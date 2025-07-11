import { describe, it, expect } from 'vitest';
import { KintoneTransformer } from './transformer';

describe('KintoneTransformer', () => {
  const transformer = new KintoneTransformer();
  
  it('should transform addEventListener for production', () => {
    const input = `
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Page loaded');
});`;
    
    const result = transformer.transform(input, { target: 'production' });
    
    expect(result.code).toContain('kintone.events.on');
    expect(result.code).toContain('app.record.index.show');
  });
  
  it('should not transform addEventListener for development', () => {
    const input = `
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Page loaded');
});`;
    
    const result = transformer.transform(input, { target: 'development' });
    
    expect(result.code).toContain('addEventListener');
    expect(result.code).not.toContain('kintone.events.on');
  });
  
  it('should handle invalid code gracefully', () => {
    const input = 'invalid javascript code {{{';
    
    expect(() => {
      transformer.transform(input);
    }).toThrow('Transform failed');
  });
  
  it('should generate source map when requested', () => {
    const input = `
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Page loaded');
});`;
    
    const result = transformer.transform(input, { 
      sourceMap: true, 
      filename: 'test.js' 
    });
    
    expect(result.map).toBeDefined();
    expect(result.map).toContain('test.js');
  });
});