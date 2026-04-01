import type { AgentPassport, GeneratePassportInput } from "../../shared/passport.js";

function pickBadge(name: string): AgentPassport["badgeColor"] {
  const colors: AgentPassport["badgeColor"][] = ["copper", "lime", "cyan", "amber", "rose"];
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export function createMockPassport(input: GeneratePassportInput): AgentPassport {
  const tone = input.domain ?? "general";

  return {
    name: input.name,
    oneLiner: `${input.name} is a ${tone} agent built to turn messy operator workflows into decisive action.`,
    mission: `Package ${input.name} as a credible operator-grade agent that helps teams move faster without hiding its limits.`,
    capabilities: [
      `Structures noisy ${tone} inputs into clear next steps`,
      "Produces concise operator-facing outputs",
      "Maintains a reusable public identity profile"
    ],
    bestUseCases: [
      "Demoing an agent to judges or partners",
      "Explaining agent scope before deployment",
      "Publishing a public-facing capability card"
    ],
    riskNotes: [
      "Requires human review for high-impact actions",
      "Output quality depends on specificity of the source brief"
    ],
    trustProfile: input.domain === "security" ? "practical" : "experimental",
    operatorType: "team",
    signatureStyle: `${tone} operator with clean edges`,
    badgeColor: pickBadge(input.name)
  };
}
