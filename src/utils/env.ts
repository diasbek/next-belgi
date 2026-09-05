export function getPublicEnv(key: string, fallback = ""): string {
  const value = process.env[key];
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}
