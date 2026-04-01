import {
  agentPassportSchema,
  badgeColorOptions,
  operatorTypeOptions,
  trustProfileOptions,
  type AgentPassport
} from "../../shared/passport.js";

function clampString(value: unknown, fallback: string, max: number) {
  const text = typeof value === "string" ? value.trim() : fallback;
  return text.slice(0, max);
}

function normalizeArray(value: unknown, length: number, fallback: string[], max: number) {
  const source = Array.isArray(value) ? value : fallback;
  return source
    .map((item, index) => clampString(item, fallback[index] ?? fallback[0], max))
    .filter(Boolean)
    .slice(0, length)
    .concat(fallback)
    .slice(0, length);
}

function enumOrFallback<T extends readonly string[]>(
  value: unknown,
  options: T,
  fallback: T[number]
): T[number] {
  return typeof value === "string" && options.includes(value as T[number])
    ? (value as T[number])
    : fallback;
}

export function normalizePassport(candidate: unknown, fallback: AgentPassport): AgentPassport {
  const raw = (candidate ?? {}) as Partial<AgentPassport>;

  const normalized: AgentPassport = {
    name: clampString(raw.name, fallback.name, 48),
    oneLiner: clampString(raw.oneLiner, fallback.oneLiner, 100),
    mission: clampString(raw.mission, fallback.mission, 180),
    capabilities: normalizeArray(raw.capabilities, 3, fallback.capabilities, 64),
    bestUseCases: normalizeArray(raw.bestUseCases, 3, fallback.bestUseCases, 72),
    riskNotes: normalizeArray(raw.riskNotes, 2, fallback.riskNotes, 72),
    trustProfile: enumOrFallback(raw.trustProfile, trustProfileOptions, fallback.trustProfile),
    operatorType: enumOrFallback(raw.operatorType, operatorTypeOptions, fallback.operatorType),
    signatureStyle: clampString(raw.signatureStyle, fallback.signatureStyle, 40),
    badgeColor: enumOrFallback(raw.badgeColor, badgeColorOptions, fallback.badgeColor)
  };

  return agentPassportSchema.parse(normalized);
}
