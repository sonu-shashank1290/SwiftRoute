import { AxiosRequestConfig } from 'axios';
import { RETRY_DELAY_MS, RETRY_STATUS_CODES } from './config';

export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export const retryRequest = async (
  apiClient: any,
  config: AxiosRequestConfig,
  retries: number,
): Promise<any> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    await sleep(RETRY_DELAY_MS * attempt);
    try {
      console.log(`[API] Retry attempt ${attempt}/${retries}:`, config.url);
      return await apiClient.request({ ...config, _skipQueue: true });
    } catch (err: any) {
      const status = err.response?.status;
      const isRetryable = RETRY_STATUS_CODES.includes(status) || !status;
      if (!isRetryable || attempt === retries) throw err;
    }
  }
};