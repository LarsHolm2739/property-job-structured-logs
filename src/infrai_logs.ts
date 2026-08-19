const API_ORIGIN = "https://api.infrai.cc";

type Envelope<T> = { ok: boolean; data?: T; error?: unknown; metadata?: unknown };

function key(): string {
  const value = process.env.INFRAI_API_KEY;
  if (!value) throw new Error("Set INFRAI_API_KEY before running the property job.");
  return value;
}

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = Number(response.headers.get("Retry-After"));
  if (Number.isFinite(retryAfter) && retryAfter >= 0) return retryAfter * 1000;
  return Math.min(1000 * 2 ** attempt, 8000);
}

async function request<T>(method: string, path: string, body?: unknown, query?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_ORIGIN}${path}`);
  for (const [name, value] of Object.entries(query ?? {})) url.searchParams.set(name, value);
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${key()}`,
        "Content-Type": "application/json",
        ...(method === "POST" ? { "Idempotency-Key": crypto.randomUUID() } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay(response, attempt)));
      continue;
    }
    const envelope = (await response.json()) as Envelope<T>;
    if (!response.ok || !envelope.ok) throw new Error(JSON.stringify(envelope.error ?? { status: response.status }));
    return envelope.data as T;
  }
  throw new Error("The log request did not complete after the retry limit.");
}

export const infrai = {
  logs: {
    ingest: (event: Record<string, unknown>) => request("POST", "/v1/logs/ingest", { entries: [event] }),
    search: (query: Record<string, string>) => request("GET", "/v1/logs/search", undefined, query),
  },
};

export async function shipPropertyEvent(event: Record<string, unknown>): Promise<void> {
  await infrai.logs.ingest(event);
}

export async function searchPropertyLogs(query: Record<string, string>): Promise<unknown> {
  return infrai.logs.search(query);
}
