import { useCallback, useEffect, useRef } from "react";
// import { isDev } from "@/utils/env";

/**
 * ===============================
 * 1️⃣ useLogger
 * ===============================
 */
export const useLogger = (namespace: string) => {
  const log = useCallback(
    (...args: any[]) => {
      //   if (isDev) console.log(`[${namespace}]`, ...args);
      console.log(`[${namespace}]`, ...args);
    },
    [namespace]
  );

  const error = useCallback(
    (...args: any[]) => {
      //   if (isDev) console.error(`[${namespace}]`, ...args);
      console.error(`[${namespace}]`, ...args);
    },
    [namespace]
  );

  return { log, error };
};

/**
 * ===============================
 * 2️⃣ useTraceUpdate
 * Logs changes of specific state or props
 * ===============================
 */
export const useTraceUpdate = (value: Record<string, any>, name?: string) => {
  const prev = useRef<Record<string, any>>({});

  useEffect(() => {
    const changed: Record<string, { from: any; to: any }> = {};
    Object.keys(value).forEach((key) => {
      if (prev.current[key] !== value[key]) {
        changed[key] = { from: prev.current[key], to: value[key] };
      }
    });

    if (Object.keys(changed).length) {
      console.log(name ?? "TraceUpdate", changed);
    }

    prev.current = value;
  });
};

/**
 * ===============================
 * 3️⃣ useWhyDidYouUpdate
 * Logs why a component re-rendered based on props
 * ===============================
 */
export const useWhyDidYouUpdate = (
  componentName: string,
  props: Record<string, any>
) => {
  const prevProps = useRef<Record<string, any>>({});

  useEffect(() => {
    const allKeys = Object.keys({ ...prevProps.current, ...props });
    const changes: Record<string, { from: any; to: any }> = {};

    allKeys.forEach((key) => {
      if (prevProps.current[key] !== props[key]) {
        changes[key] = { from: prevProps.current[key], to: props[key] };
      }
    });

    if (Object.keys(changes).length) {
      console.log(`[WhyDidYouUpdate] ${componentName}`, changes);
    }

    prevProps.current = props;
  });
};
