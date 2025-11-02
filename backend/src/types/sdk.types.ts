export interface SDKClient {
  id: string;
  client_id: string;
  client_secret: string;
  app_name: string;
  app_url?: string;
  redirect_uris: string[];
  created_by: string;
  created_at: string;
}

export interface APIUsage {
  id: string;
  client_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  timestamp: string;
}