import type { AgentPassport, DomainOption } from "../../shared/passport";
import type { HealthResponse } from "./types";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload as T;
}

export async function getHealth() {
  const response = await fetch("/api/health");
  return parseJson<HealthResponse>(response);
}

export async function generatePassport(payload: {
  name: string;
  description: string;
  domain?: DomainOption;
}) {
  const response = await fetch("/api/passport/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseJson<{ passport: AgentPassport; mode: "live" | "mock" }>(response);
}

export async function savePassport(passport: AgentPassport) {
  const response = await fetch("/api/passport/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ passport })
  });

  return parseJson<{
    rootHash: string;
    txHash?: string;
    savedAt: string;
    mode: "live" | "mock";
  }>(response);
}
