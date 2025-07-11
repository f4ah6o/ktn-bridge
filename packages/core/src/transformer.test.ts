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
  
  it('should transform submit event for production', () => {
    const input = `
document.addEventListener('submit', (event) => {
  console.log('Form submitted');
});`;
    
    const result = transformer.transform(input, { target: 'production' });
    
    expect(result.code).toContain('kintone.events.on');
    expect(result.code).toContain('app.record.create.submit');
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
  
  it('should not transform submit event for development', () => {
    const input = `
document.addEventListener('submit', (event) => {
  console.log('Form submitted');
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
  
  it('should generate detailed source map with transformation mappings', () => {
    const input = `
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Page loaded');
});
const response = await fetch('/api/records?app=1');`;
    
    const result = transformer.transform(input, { 
      sourceMap: true, 
      filename: 'test.js',
      target: 'production' 
    });
    
    expect(result.map).toBeDefined();
    expect(result.map).toContain('test.js');
    expect(result.map).toContain('DOMContentLoaded->app.record.index.show');
    expect(result.map).toContain('fetch(/api/records?app=1)->kintone.api(/k/v1/records)');
  });
  
  it('should preserve other event listeners unchanged', () => {
    const input = `
document.addEventListener('click', (event) => {
  console.log('Clicked');
});`;
    
    const result = transformer.transform(input, { target: 'production' });
    
    expect(result.code).toContain('addEventListener');
    expect(result.code).toContain('click');
    expect(result.code).not.toContain('kintone.events.on');
  });
  
  it('should transform fetch API to kintone.api for production', () => {
    const input = `
const response = await fetch('/api/records?app=1');
const data = await response.json();`;
    
    const result = transformer.transform(input, { target: 'production' });
    
    expect(result.code).toContain('kintone.api');
    expect(result.code).toContain('/k/v1/records');
    expect(result.code).not.toContain('fetch');
  });
  
  it('should transform fetch API for record detail', () => {
    const input = `
const response = await fetch('/api/record?app=1&id=123');
const data = await response.json();`;
    
    const result = transformer.transform(input, { target: 'production' });
    
    expect(result.code).toContain('kintone.api');
    expect(result.code).toContain('/k/v1/record');
    expect(result.code).not.toContain('fetch');
  });
  
  it('should not transform fetch API for development', () => {
    const input = `
const response = await fetch('/api/records?app=1');
const data = await response.json();`;
    
    const result = transformer.transform(input, { target: 'development' });
    
    expect(result.code).toContain('fetch');
    expect(result.code).not.toContain('kintone.api');
  });
  
  it('should preserve other fetch calls unchanged', () => {
    const input = `
const response = await fetch('/external/api');
const data = await response.json();`;
    
    const result = transformer.transform(input, { target: 'production' });
    
    expect(result.code).toContain('fetch');
    expect(result.code).not.toContain('kintone.api');
  });
});