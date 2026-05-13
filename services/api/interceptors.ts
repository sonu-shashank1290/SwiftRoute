import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { isOnline, enqueueRequest } from './queue';
import { retryRequest, sleep } from './retry';
import { RETRY_STATUS_CODES, RETRY_DELAY_MS } from './config';

const generateRequestId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const activeRequests = new Map<string, AbortController>();

export const cancelRequest = (requestId: string) => {
  const controller = activeRequests.get(requestId);
  if (controller) {
    controller.abort();
    activeRequests.delete(requestId);
    console.log('[API] Cancelled:', requestId);
  }
};

export const cancelAllRequests = () => {
  for (const [id, controller] of activeRequests) {
    controller.abort();
    console.log('[API] Cancelled:', id);
  }
  activeRequests.clear();
};

export const attachInterceptors = (apiClient: AxiosInstance) => {
  // ─── Request ───────────────────────────────────────────────────────────────
  apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (!isOnline() && !config._skipQueue) {
        return Promise.reject({ __queued: true, config });
      }

      const requestId = generateRequestId();
      config._meta = { startTime: Date.now(), requestId };

      const controller = new AbortController();
      config.signal = controller.signal;
      activeRequests.set(requestId, controller);

      // const token = useAuthStore.getState().token;
      // if (token) config.headers.Authorization = `Bearer ${token}`;

      console.log(`[API ▶] ${config.method?.toUpperCase()} ${config.url} [${requestId}]`);
      return config;
    },
    error => Promise.reject(error),
  );

  // ─── Response ──────────────────────────────────────────────────────────────
  let isRefreshingToken = false;

  apiClient.interceptors.response.use(
    response => {
      const meta = (response.config as InternalAxiosRequestConfig)._meta;
      if (meta) {
        const duration = Date.now() - meta.startTime;
        activeRequests.delete(meta.requestId);
        console.log(
          `[API ✓] ${response.config.method?.toUpperCase()} ${response.config.url} — ${duration}ms [${meta.requestId}]`,
        );
      }
      return response;
    },

    async error => {
      if (error.__queued) {
        return enqueueRequest(error.config);
      }

      const config = error.config as InternalAxiosRequestConfig;
      const meta = config?._meta;
      const status = error.response?.status;

      if (meta) {
        activeRequests.delete(meta.requestId);
        console.error(
          `[API ✗] ${config.method?.toUpperCase()} ${config.url} — ${status ?? 'NO_RESPONSE'} [${meta.requestId}]`,
        );
      } else {
        console.error(`[API ✗] Unknown request failed — ${status ?? 'NO_RESPONSE'}`);
      }

      // 401 — token refresh
      if (status === 401 && !config._skipQueue) {
        if (!isRefreshingToken) {
          isRefreshingToken = true;
          try {
            // await refreshAuthToken();
            console.warn('[API] Token expired — refresh would happen here');
            isRefreshingToken = false;
            return apiClient.request({ ...config, _skipQueue: true });
          } catch (refreshError) {
            isRefreshingToken = false;
            console.error('[API] Token refresh failed, logging out');
            return Promise.reject(refreshError);
          }
        }
      }

      // 429 — rate limit
      if (status === 429) {
        const retryAfter = error.response?.headers['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY_MS;
        console.warn(`[API] Rate limited — retrying after ${delay}ms`);
        await sleep(delay);
        return apiClient.request({ ...config, _skipQueue: true });
      }

      // 5xx / network errors
      if (RETRY_STATUS_CODES.includes(status) && !config._skipQueue) {
        try {
          return await retryRequest(apiClient, config, 3);
        } catch (retryError) {
          console.error('[API] All retries exhausted:', config.url);
          return Promise.reject(retryError);
        }
      }

      return Promise.reject(error);
    },
  );
};