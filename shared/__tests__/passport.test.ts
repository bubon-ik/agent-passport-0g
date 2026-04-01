import { describe, it, expect } from "vitest";
import { agentPassportSchema, generatePassportInputSchema } from "../../shared/passport.js";

describe("agentPassportSchema", () => {
  const valid = {
    name: "TestAgent",
    oneLiner: "A test agent with a clear purpose.",
    mission: "Help developers write and run better automated tests faster.",
    capabilities: ["Parses test output", "Generates test cases", "Reports coverage gaps"],
    bestUseCases: ["CI pipelines", "Code review automation", "Developer tooling"],
    riskNotes: ["Requires access to source code", "May flag false positives"],
    trustProfile: "practical",
    operatorType: "team",
    signatureStyle: "methodical reviewer",
    badgeColor: "cyan"
  };

  it("accepts a fully valid passport", () => {
    expect(() => agentPassportSchema.parse(valid)).not.toThrow();
  });

  it("rejects name shorter than 2 characters", () => {
    expect(() => agentPassportSchema.parse({ ...valid, name: "A" })).toThrow();
  });

  it("rejects name longer than 48 characters", () => {
    expect(() => agentPassportSchema.parse({ ...valid, name: "A".repeat(49) })).toThrow();
  });

  it("rejects oneLiner shorter than 12 characters", () => {
    expect(() => agentPassportSchema.parse({ ...valid, oneLiner: "Too short" })).toThrow();
  });

  it("rejects oneLiner longer than 100 characters", () => {
    expect(() => agentPassportSchema.parse({ ...valid, oneLiner: "A".repeat(101) })).toThrow();
  });

  it("rejects mission shorter than 20 characters", () => {
    expect(() => agentPassportSchema.parse({ ...valid, mission: "Too short" })).toThrow();
  });

  it("rejects capabilities with fewer than 3 items", () => {
    expect(() =>
      agentPassportSchema.parse({ ...valid, capabilities: ["one", "two"] })
    ).toThrow();
  });

  it("rejects capabilities with more than 3 items", () => {
    expect(() =>
      agentPassportSchema.parse({
        ...valid,
        capabilities: ["one", "two", "three", "four"]
      })
    ).toThrow();
  });

  it("rejects riskNotes with fewer than 2 items", () => {
    expect(() =>
      agentPassportSchema.parse({ ...valid, riskNotes: ["only one"] })
    ).toThrow();
  });

  it("rejects riskNotes with more than 2 items", () => {
    expect(() =>
      agentPassportSchema.parse({ ...valid, riskNotes: ["one", "two", "three"] })
    ).toThrow();
  });

  it("rejects an invalid trustProfile", () => {
    expect(() =>
      agentPassportSchema.parse({ ...valid, trustProfile: "omniscient" })
    ).toThrow();
  });

  it("accepts all valid trustProfile values", () => {
    for (const tp of ["experimental", "practical", "high-autonomy"]) {
      expect(() => agentPassportSchema.parse({ ...valid, trustProfile: tp })).not.toThrow();
    }
  });

  it("rejects an invalid operatorType", () => {
    expect(() =>
      agentPassportSchema.parse({ ...valid, operatorType: "singleton" })
    ).toThrow();
  });

  it("accepts all valid operatorType values", () => {
    for (const ot of ["solo", "team", "protocol"]) {
      expect(() => agentPassportSchema.parse({ ...valid, operatorType: ot })).not.toThrow();
    }
  });

  it("rejects an invalid badgeColor", () => {
    expect(() =>
      agentPassportSchema.parse({ ...valid, badgeColor: "purple" })
    ).toThrow();
  });

  it("accepts all valid badgeColor values", () => {
    for (const color of ["copper", "lime", "cyan", "amber", "rose"]) {
      expect(() => agentPassportSchema.parse({ ...valid, badgeColor: color })).not.toThrow();
    }
  });

  it("trims whitespace from string fields", () => {
    const result = agentPassportSchema.parse({ ...valid, name: "  TestAgent  " });
    expect(result.name).toBe("TestAgent");
  });
});

describe("generatePassportInputSchema", () => {
  it("accepts valid input without domain", () => {
    expect(() =>
      generatePassportInputSchema.parse({
        name: "MyAgent",
        description: "An agent that processes structured data inputs efficiently."
      })
    ).not.toThrow();
  });

  it("accepts valid input with domain", () => {
    expect(() =>
      generatePassportInputSchema.parse({
        name: "MyAgent",
        description: "An agent that processes structured data inputs efficiently.",
        domain: "research"
      })
    ).not.toThrow();
  });

  it("rejects name shorter than 2 characters", () => {
    expect(() =>
      generatePassportInputSchema.parse({
        name: "A",
        description: "An agent that processes structured data inputs efficiently."
      })
    ).toThrow();
  });

  it("rejects description shorter than 20 characters", () => {
    expect(() =>
      generatePassportInputSchema.parse({ name: "MyAgent", description: "Too short" })
    ).toThrow();
  });

  it("rejects description longer than 700 characters", () => {
    expect(() =>
      generatePassportInputSchema.parse({
        name: "MyAgent",
        description: "A".repeat(701)
      })
    ).toThrow();
  });

  it("rejects an invalid domain", () => {
    expect(() =>
      generatePassportInputSchema.parse({
        name: "MyAgent",
        description: "An agent that processes structured data inputs efficiently.",
        domain: "finance"
      })
    ).toThrow();
  });

  it("accepts all valid domain values", () => {
    for (const domain of ["research", "trading", "support", "content", "security"]) {
      expect(() =>
        generatePassportInputSchema.parse({
          name: "MyAgent",
          description: "An agent that processes structured data inputs efficiently.",
          domain
        })
      ).not.toThrow();
    }
  });
});
