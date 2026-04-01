import { z } from "zod";

export const domainOptions = [
  "research",
  "trading",
  "support",
  "content",
  "security"
] as const;

export const trustProfileOptions = [
  "experimental",
  "practical",
  "high-autonomy"
] as const;

export const operatorTypeOptions = ["solo", "team", "protocol"] as const;

export const badgeColorOptions = ["copper", "lime", "cyan", "amber", "rose"] as const;

const shortText = (min: number, max: number) => z.string().trim().min(min).max(max);

export const agentPassportSchema = z.object({
  name: shortText(2, 48),
  oneLiner: shortText(12, 100),
  mission: shortText(20, 180),
  capabilities: z.array(shortText(4, 64)).length(3),
  bestUseCases: z.array(shortText(4, 72)).length(3),
  riskNotes: z.array(shortText(4, 72)).length(2),
  trustProfile: z.enum(trustProfileOptions),
  operatorType: z.enum(operatorTypeOptions),
  signatureStyle: shortText(4, 40),
  badgeColor: z.enum(badgeColorOptions)
});

export const generatePassportInputSchema = z.object({
  name: shortText(2, 48),
  description: shortText(20, 700),
  domain: z.enum(domainOptions).optional()
});

export type AgentPassport = z.infer<typeof agentPassportSchema>;
export type GeneratePassportInput = z.infer<typeof generatePassportInputSchema>;
export type DomainOption = (typeof domainOptions)[number];
