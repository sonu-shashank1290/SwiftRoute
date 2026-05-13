import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from './config';
import { initNetworkMonitor, getQueueSize, flushQueue } from './queue';
import { attachInterceptors, cancelRequest, cancelAllRequests } from './interceptors';

export { cancelRequest, cancelAllRequests };
export { getQueueSize };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

attachInterceptors(apiClient);
initNetworkMonitor(apiClient);

export const forceFlushQueue = () => flushQueue(apiClient);