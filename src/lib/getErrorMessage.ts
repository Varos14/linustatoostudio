export function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null) {
    const maybe = (err as any).message ?? (err as any).error ?? (err as any).toString?.();
    if (typeof maybe === "string" && maybe.length) return maybe;
  }
  try {
    return String(err);
  } catch {
    return "Unknown error";
  }
}