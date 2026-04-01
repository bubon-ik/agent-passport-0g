export type TrustProfile = "experimental" | "practical" | "high-autonomy";
export type OperatorType = "solo" | "team" | "protocol";
export type BadgeColor = "copper" | "lime" | "cyan" | "amber" | "rose";
export type DomainOption = "research" | "trading" | "support" | "content" | "security";

export type AgentPassport = {
  name: string;
  oneLiner: string;
  mission: string;
  capabilities: string[];
  bestUseCases: string[];
  riskNotes: string[];
  trustProfile: TrustProfile;
  operatorType: OperatorType;
  signatureStyle: string;
  badgeColor: BadgeColor;
};

export type HealthResponse = {
  ok: boolean;
  computeConfigured: boolean;
  storageConfigured: boolean;
};
