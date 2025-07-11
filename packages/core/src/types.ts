export interface KintoneEvent {
  type: string;
  appId?: string;
  recordId?: string;
  records?: KintoneRecord[];
  record?: KintoneRecord;
  [key: string]: any;
}

export interface KintoneRecord {
  [fieldCode: string]: KintoneFieldValue;
}

export interface KintoneFieldValue {
  type: string;
  value: any;
}

export interface KintoneApiRequest {
  pathOrUrl: string;
  method: string;
  params?: any;
}

export interface EventMapping {
  kintoneEvent: string;
  web: {
    event: string;
    selector?: string;
    description: string;
  };
  transform: {
    in: (webEvent: Event) => KintoneEvent;
    out: (kintoneEvent: KintoneEvent) => CustomEvent;
  };
  example: {
    web: string;
    kintone: string;
  };
  since?: string;
  deprecated?: boolean;
}

export interface ApiMapping {
  kintoneApi: string;
  web: {
    method: string;
    description: string;
  };
  transform: {
    request: (webRequest: Request) => KintoneApiRequest;
    response: (kintoneResponse: any) => Response;
  };
  example: {
    web: string;
    kintone: string;
  };
}

export interface TransformResult {
  code: string;
  map?: string;
  dependencies?: string[];
}

export interface TransformOptions {
  sourceMap?: boolean;
  filename?: string;
  target?: 'development' | 'production';
}