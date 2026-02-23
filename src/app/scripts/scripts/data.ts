export type ScriptCategory = "scripts" | "utils" | "hooks";

export type Script = {
  /** Stable id used by the API route */
  id: string;
  /** Display name in the card */
  name: string;
  /** Short description shown under the title */
  description: string;
  /** High‑level category badge */
  category: string;
  /** Language / environment badge */
  language: string;
  /** One‑line primary use case */
  useCase: string;
  /** Bullet points rendered as feature chips */
  features: string[];
  /** Tab segment this item belongs to */
  segment: ScriptCategory;
  /** Path to the actual source file, relative to project root */
  filePath: string;
  /** Suggested filename when downloading */
  fileName: string;
};

export const scripts: Script[] = [
  /**
   * ======================
   *  Scripts (Node / CLI)
   * ======================
   */
  {
    id: "remove-logs",
    name: "Remove Console Logs",
    description:
      "CLI utility that recursively strips console.log statements from your JS/TS codebase.",
    category: "Codebase Cleanup",
    language: "Node.js",
    useCase: "Prepare production builds by removing noisy debug logging.",
    features: [
      "Recursive directory traversal",
      "Targets JS/TS source files",
      "Skips common build and dependency folders",
      "Overwrites files in-place safely",
    ],
    segment: "scripts",
    filePath: "src/assets/tools/scripts/removeLogs.js",
    fileName: "removeLogs.js",
  },
  {
    id: "generate-svg-icons",
    name: "SVG → React Native Icon Generator",
    description:
      "Converts raw SVG assets into typed React Native SVG icon components and updates your icon registry.",
    category: "Asset Pipeline",
    language: "Node.js",
    useCase: "Automate icon generation for React Native projects.",
    features: [
      "Processes all SVGs in a folder",
      "Uses SVGR CLI under the hood",
      "Normalizes component names to PascalCase",
      "Updates shared icon list automatically",
    ],
    segment: "scripts",
    filePath: "src/assets/tools/scripts/generate-svg.js",
    fileName: "generate-svg.js",
  },

  /**
   * =========
   *  Hooks
   * =========
   */
  {
    id: "logging-hooks",
    name: "Logging & Render Debugging Hooks",
    description:
      "A small suite of React hooks for namespaced logging and understanding why components re-render.",
    category: "Hooks",
    language: "TypeScript / React",
    useCase: "Diagnose re-renders and track state/prop changes during development.",
    features: [
      "Namespaced logging via useLogger",
      "Track specific value changes with useTraceUpdate",
      "Explain re-renders with useWhyDidYouUpdate",
      "Drop-in utilities for debugging complex components",
    ],
    segment: "hooks",
    filePath: "src/assets/tools/hooks/logging.ts",
    fileName: "logging.ts",
  },
  {
    id: "use-counter",
    name: "useCounter Hook",
    description:
      "A flexible counter hook with min/max bounds, custom step size, and imperative setters.",
    category: "State Management",
    language: "TypeScript / React",
    useCase: "Build counters, pagination, steppers, and numeric inputs.",
    features: [
      "Configurable initial value",
      "Min/max clamping",
      "Custom step size",
      "Increment, decrement, reset, and set helpers",
    ],
    segment: "hooks",
    filePath: "src/assets/tools/hooks/useCounter.ts",
    fileName: "useCounter.ts",
  },
  {
    id: "use-scroll-position",
    name: "useScrollPosition Hook",
    description:
      "Track the window scroll position and react to changes in X/Y coordinates.",
    category: "UI / UX",
    language: "TypeScript / React",
    useCase: "Implement sticky headers, scroll-based animations, or back-to-top buttons.",
    features: [
      "Exposes x and y scroll values",
      "Subscribes to window scroll events",
      "Cleans up listeners on unmount",
      "Safe default values during SSR",
    ],
    segment: "hooks",
    filePath: "src/assets/tools/hooks/useScrollPosition.ts",
    fileName: "useScrollPosition.ts",
  },
  {
    id: "use-window-size",
    name: "useWindowSize Hook",
    description:
      "Responsive hook that tracks the current window width and height.",
    category: "Responsive Layout",
    language: "TypeScript / React",
    useCase: "Drive responsive layouts, breakpoints, and conditional rendering.",
    features: [
      "Realtime resize tracking",
      "Width and height values",
      "Listener cleanup on unmount",
      "SSR-safe initialization",
    ],
    segment: "hooks",
    filePath: "src/assets/tools/hooks/useWindowSize.ts",
    fileName: "useWindowSize.ts",
  },

  /**
   * =======
   *  Utils
   * =======
   */
  {
    id: "query-string-utils",
    name: "Query String Utilities",
    description:
      "Helpers for building and parsing URLs with strong typing support.",
    category: "URL Helpers",
    language: "TypeScript",
    useCase: "Encode filters, pagination, and search params into query strings.",
    features: [
      "Build query strings from typed objects",
      "Supports arrays and primitives",
      "Gracefully skips empty values",
      "Parse query strings back to objects",
    ],
    segment: "utils",
    filePath: "src/assets/tools/utils/queryString.ts",
    fileName: "queryString.ts",
  },
  {
    id: "env-flags",
    name: "Environment Flags",
    description:
      "Tiny helpers for checking dev/prod/test environments and client/server context.",
    category: "Runtime",
    language: "TypeScript",
    useCase: "Toggle behavior based on environment or rendering context.",
    features: [
      "isDev / isProd / isTest flags",
      "Detects client vs server",
      "Zero dependencies",
      "Works in Node and browser builds",
    ],
    segment: "utils",
    filePath: "src/assets/tools/utils/env.ts",
    fileName: "env.ts",
  },
  {
    id: "retry-promise",
    name: "Retry Promise Utility",
    description:
      "Robust retry helper for async operations with optional exponential backoff.",
    category: "Resilience",
    language: "TypeScript",
    useCase: "Wrap unstable APIs or network calls with automatic retries.",
    features: [
      "Configurable retries and delay",
      "Optional exponential backoff",
      "Generic typing for return values",
      "Simple async API",
    ],
    segment: "utils",
    filePath: "src/assets/tools/utils/retryPromise.ts",
    fileName: "retryPromise.ts",
  },
  {
    id: "sleep-promise",
    name: "Sleep Promise Helper",
    description:
      "Minimal sleep utility that returns a promise resolving after a delay.",
    category: "Timing",
    language: "TypeScript",
    useCase: "Throttle actions, wait between retries, or simulate latency.",
    features: [
      "Promise-based delay",
      "Works in async/await flows",
      "Simple and focused implementation",
      "Reusable across projects",
    ],
    segment: "utils",
    filePath: "src/assets/tools/utils/sleep.ts",
    fileName: "sleep.ts",
  },
  {
    id: "cancelable-promise",
    name: "Cancelable Promise Wrapper",
    description:
      "Wrap any promise with a cancel API to ignore late results when no longer needed.",
    category: "Async Control",
    language: "TypeScript",
    useCase: "Cancel in-flight requests when components unmount or inputs change.",
    features: [
      "CancelablePromise interface",
      "Ignore resolution after cancel",
      "Lightweight wrapper around existing promises",
      "Ideal for UI-driven requests",
    ],
    segment: "utils",
    filePath: "src/assets/tools/utils/cancelablePromise.ts",
    fileName: "cancelablePromise.ts",
  },
  {
    id: "find-changed-fields",
    name: "findChangedFields Utility",
    description:
      "Diff two plain objects and return only the fields that changed.",
    category: "Data Comparison",
    language: "TypeScript",
    useCase: "Send minimal PATCH payloads or audit changed properties.",
    features: [
      "Deep comparison for nested values",
      "Returns partial object of changes",
      "Handles arrays and objects",
      "Great for form diffs and updates",
    ],
    segment: "utils",
    filePath: "src/assets/tools/utils/findChangedFields.ts",
    fileName: "findChangedFields.ts",
  },
  {
    id: "lodash-lite",
    name: "Lodash-lite Utilities",
    description:
      "A focused collection of lodash-style helpers for debounce, throttle, cloning, and more.",
    category: "Utility",
    language: "TypeScript",
    useCase: "Reach for common lodash patterns without the full dependency.",
    features: [
      "debounce and throttle functions",
      "cloneDeep for structured cloning",
      "Deep equality check with isEqual",
      "uniqBy, groupBy, and orderBy helpers",
    ],
    segment: "utils",
    filePath: "src/assets/tools/utils/lodash.ts",
    fileName: "lodash.ts",
  },
];

