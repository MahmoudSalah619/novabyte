export interface RetryOptions {
  retries?: number;
  delay?: number;
  backoff?: boolean;
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const retry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const { retries = 3, delay = 500, backoff = true } = options;

  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;

      await sleep(waitTime);
      attempt++;
    }
  }

  // Should never reach here
  throw new Error("Retry failed unexpectedly.");
};
