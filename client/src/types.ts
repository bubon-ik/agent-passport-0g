// Re-export from shared to avoid duplication with server types.
// AgentPassport and its field types are the source of truth in shared/passport.ts.
export type { AgentPassport, DomainOption } from "../../shared/passport";

// Client-only types (not in shared schema)
export type HealthResponse = {
  ok: boolean;
  computeConfigured: boolean;
  storageConfigured: boolean;
  storageReachable: boolean;
};
