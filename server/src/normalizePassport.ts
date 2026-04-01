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
  const normalized: AgentPassport = {
    name: clampString((candidate as AgentPassport | undefined)?.name, fallback.name, 48),
    oneLiner: clampString((candidate as AgentPassport | undefined)?.oneLiner, fallback.oneLiner, 100),
    mission: clampString((candidate as AgentPassport | undefined)?.mission, fallback.mission, 180),
    capabilities: normalizeArray(
      (candidate as AgentPassport | undefined)?.capabilities,
      3,
      fallback.capabilities,
      64
    ),
    bestUseCases: normalizeArray(
      (candidate as AgentPassport | undefined)?.bestUseCases,
      3,
      fallback.bestUseCases,
      72
    ),
    riskNotes: normalizeArray(
      (candidate as AgentPassport | undefined)?.riskNotes,
      2,
      fallback.riskNotes,
      72
    ),
    trustProfile: enumOrFallback(
      (candidate as AgentPassport | undefined)?.trustProfile,
      trustProfileOptions,
      fallback.trustProfile
    ),
    operatorType: enumOrFallback(
      (candidate as AgentPassport | undefined)?.operatorType,
      operatorTypeOptions,
      fallback.operatorType
    ),
    signatureStyle: clampString(
      (candidate as AgentPassport | undefined)?.signatureStyle,
      fallback.signatureStyle,
      40
    ),
    badgeColor: enumOrFallback(
      (candidate as AgentPassport | undefined)?.badgeColor,
      badgeColorOptions,
      fallback.badgeColor
    )
  };

  return agentPassportSchema.parse(normalized);
}
