/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Debounce
 */
export const debounce = <T extends (...args: any[]) => void>(
    fn: T,
    wait = 300
  ) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
  
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  };
  
  /**
   * Throttle
   */
  export const throttle = <T extends (...args: any[]) => void>(
    fn: T,
    wait = 300
  ) => {
    let lastCall = 0;
  
    return (...args: Parameters<T>) => {
      const now = Date.now();
  
      if (now - lastCall >= wait) {
        lastCall = now;
        fn(...args);
      }
    };
  };
  
  /**
   * Deep Clone
   */
  export const cloneDeep = <T>(value: T): T => {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }
  
    return JSON.parse(JSON.stringify(value));
  };
  
  /**
   * Deep Equal
   */
  export const isEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
  
    if (
      typeof a !== "object" ||
      typeof b !== "object" ||
      a === null ||
      b === null
    ) {
      return false;
    }
  
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
  
    if (keysA.length !== keysB.length) return false;
  
    for (const key of keysA) {
      if (!keysB.includes(key) || !isEqual(a[key], b[key])) {
        return false;
      }
    }
  
    return true;
  };
  
  /**
   * Unique By
   */
  export const uniqBy = <T, K extends keyof T>(
    array: T[],
    key: K
  ): T[] => {
    const seen = new Set<T[K]>();
  
    return array.filter((item) => {
      const value = item[key];
  
      if (seen.has(value)) return false;
  
      seen.add(value);
      return true;
    });
  };
  
  /**
   * Group By
   */
  export const groupBy = <T, K extends keyof T>(
    array: T[],
    key: K
  ): Record<string, T[]> => {
    return array.reduce<Record<string, T[]>>((acc, item) => {
      const groupKey = String(item[key]);
  
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
  
      acc[groupKey].push(item);
  
      return acc;
    }, {});
  };
  
  /**
   * Order By
   */
  export const orderBy = <T, K extends keyof T>(
    array: T[],
    key: K,
    direction: "asc" | "desc" = "asc"
  ): T[] => {
    return [...array].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
  
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
  
      return 0;
    });
  };