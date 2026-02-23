export function findChangedFields<T extends object>(
  previous: T,
  current: T
): Partial<T> {
  const changes: Partial<T> = {};

  const allKeys = new Set([
    ...Object.keys(previous),
    ...Object.keys(current),
  ]) as Set<keyof T>;

  for (const key of Array.from(allKeys)) {
    const prevValue = previous[key];
    const currValue = current[key];

    if (!isEqual(prevValue, currValue)) {
      changes[key] = currValue;
    }
  }

  return changes;
}

function isEqual(a: any, b: any): boolean {
  // Handle null/undefined cases
  if (a === b) return true;
  if (a == null || b == null) return false;

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }

  // Handle objects
  if (typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every((key) => bKeys.includes(key) && isEqual(a[key], b[key]));
  }

  // Handle primitives
  return a === b;
}
