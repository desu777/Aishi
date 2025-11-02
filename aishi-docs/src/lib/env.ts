/**
 * Simple env helper for client/server usage.
 * Prefer NEXT_PUBLIC_AISHI_URL but fall back to AISHI_URL or default.
 */
export const AISHI_URL: string =
  (process.env.NEXT_PUBLIC_AISHI_URL as string) ||
  (process.env.AISHI_URL as string) ||
  'https://aishi.app';

