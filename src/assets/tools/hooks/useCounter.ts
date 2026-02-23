import { useState, useCallback } from "react";

export interface UseCounterOptions {
  initial?: number;
  min?: number;
  max?: number;
  step?: number;
}

export const useCounter = (options: UseCounterOptions = {}) => {
  const { initial = 0, min = -Infinity, max = Infinity, step = 1 } = options;
  const [count, setCount] = useState(initial);

  const increment = useCallback(() => {
    setCount((prev) => Math.min(prev + step, max));
  }, [step, max]);

  const decrement = useCallback(() => {
    setCount((prev) => Math.max(prev - step, min));
  }, [step, min]);

  const reset = useCallback(() => setCount(initial), [initial]);

  const set = useCallback((value: number) => {
    setCount(Math.max(Math.min(value, max), min));
  }, [min, max]);

  return { count, increment, decrement, reset, set };
};