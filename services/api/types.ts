import { AxiosRequestConfig } from 'axios';

export type QueuedRequest = {
  config: AxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  retries: number;
  enqueuedAt: number;
};

export type RequestMetadata = {
  startTime: number;
  requestId: string;
};

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _meta?: RequestMetadata;
    _skipQueue?: boolean;
  }
  interface AxiosRequestConfig {
    _skipQueue?: boolean;
  }
}