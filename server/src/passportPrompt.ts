import type { GeneratePassportInput } from "../../shared/passport.js";

export function buildPassportPrompt(input: GeneratePassportInput) {
  return [
    "You are an agent identity designer.",
    "Return JSON only. No markdown. No commentary.",
    "Write concise, credible, product-grade copy.",
    "Do not promise impossible guarantees.",
    "Use exactly these keys:",
    "name, oneLiner, mission, capabilities, bestUseCases, riskNotes, trustProfile, operatorType, signatureStyle, badgeColor",
    "capabilities must be an array of exactly 3 short strings.",
    "bestUseCases must be an array of exactly 3 short strings.",
    "riskNotes must be an array of exactly 2 short strings.",
    "trustProfile must be one of: experimental, practical, high-autonomy.",
    "operatorType must be one of: solo, team, protocol.",
    "badgeColor must be one of: copper, lime, cyan, amber, rose.",
    `Agent name: ${input.name}`,
    `Primary domain: ${input.domain ?? "unspecified"}`,
    `Agent description: ${input.description}`
  ].join("\n");
}
