export const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

export const isProd =
  typeof process !== "undefined" && process.env.NODE_ENV === "production";

export const isTest =
  typeof process !== "undefined" && process.env.NODE_ENV === "test";

export const isClient = typeof window !== "undefined";

export const isServer = !isClient;
