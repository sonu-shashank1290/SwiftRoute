import { AxiosRequestConfig } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { QueuedRequest } from './types';
import { QUEUE_TIMEOUT_MS } from './config';

let _isOnline: boolean | null = null;
export const isOnline = () => _isOnline;
const requestQueue: QueuedRequest[] = [];

export const getQueueSize = () => requestQueue.length;

export const enqueueRequest = (config: AxiosRequestConfig): Promise<any> => {
  return new Promise((resolve, reject) => {
    console.log('[API] Queued offline:', config.url);
    requestQueue.push({
      config,
      resolve,
      reject,
      retries: 0,
      enqueuedAt: Date.now(),
    });
  });
};

export const flushQueue = async (apiClient: any) => {
  const now = Date.now();
  const expired: QueuedRequest[] = [];
  const valid: QueuedRequest[] = [];

  for (const req of requestQueue) {
    if (now - req.enqueuedAt > QUEUE_TIMEOUT_MS) {
      expired.push(req);
    } else {
      valid.push(req);
    }
  }

  for (const req of expired) {
    console.warn('[API] Queue item expired, dropping:', req.config.url);
    req.reject(new Error('Request expired in offline queue'));
  }

  requestQueue.length = 0;

  for (const req of valid) {
    try {
      const response = await apiClient.request({ ...req.config, _skipQueue: true });
      req.resolve(response);
    } catch (err) {
      req.reject(err);
    }
  }
};

export const initNetworkMonitor = (apiClient: any) => {
  NetInfo.fetch().then(state => {
    _isOnline = !!state.isConnected;
    console.log('[API] Initial network state:', _isOnline);
  });

  // then listen for changes
  NetInfo.addEventListener(state => {
    console.log(state,"s1")
    const wasOffline = _isOnline === false;
    _isOnline = !!state.isConnected;

    if (wasOffline && _isOnline) {
      console.log('[API] Back online — flushing queue:', getQueueSize());
      flushQueue(apiClient);
    } else if (!_isOnline) {
      console.warn('[API] Gone offline');
    }
  });
};