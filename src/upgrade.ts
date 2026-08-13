export interface UpgradePayload {
  a: string;
  b: string;
  name: string;
  seed: number;
}

export interface UpgradeResult {
  name?: string;
  lore?: string;
}

export async function tryUpgrade(payload: UpgradePayload): Promise<UpgradeResult | null> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 900);
  try {
    const res = await fetch("/api/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as UpgradeResult;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}
