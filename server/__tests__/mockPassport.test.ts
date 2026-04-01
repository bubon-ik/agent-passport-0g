import { describe, it, expect } from "vitest";
import { createMockPassport } from "../../server/src/mockPassport.js";
import type { GeneratePassportInput } from "../../shared/passport.js";

describe("createMockPassport", () => {
  const baseInput: GeneratePassportInput = {
    name: "DemoBot",
    description: "A demo bot for testing the mock passport factory."
  };

  it("returns a passport with the correct name", () => {
    const passport = createMockPassport(baseInput);
    expect(passport.name).toBe("DemoBot");
  });

  it("returns a passport with exactly 3 capabilities", () => {
    const passport = createMockPassport(baseInput);
    expect(passport.capabilities).toHaveLength(3);
  });

  it("returns a passport with exactly 3 bestUseCases", () => {
    const passport = createMockPassport(baseInput);
    expect(passport.bestUseCases).toHaveLength(3);
  });

  it("returns a passport with exactly 2 riskNotes", () => {
    const passport = createMockPassport(baseInput);
    expect(passport.riskNotes).toHaveLength(2);
  });

  it("returns trustProfile 'practical' for security domain", () => {
    const passport = createMockPassport({ ...baseInput, domain: "security" });
    expect(passport.trustProfile).toBe("practical");
  });

  it("returns trustProfile 'experimental' for non-security domains", () => {
    for (const domain of ["research", "trading", "support", "content"] as const) {
      const passport = createMockPassport({ ...baseInput, domain });
      expect(passport.trustProfile).toBe("experimental");
    }
  });

  it("returns trustProfile 'experimental' when domain is undefined", () => {
    const passport = createMockPassport(baseInput);
    expect(passport.trustProfile).toBe("experimental");
  });

  it("returns a valid badgeColor", () => {
    const validColors = ["copper", "lime", "cyan", "amber", "rose"];
    const passport = createMockPassport(baseInput);
    expect(validColors).toContain(passport.badgeColor);
  });

  it("returns deterministic badgeColor for the same name", () => {
    const first = createMockPassport(baseInput);
    const second = createMockPassport(baseInput);
    expect(first.badgeColor).toBe(second.badgeColor);
  });

  it("may return different badgeColors for different names", () => {
    const colors = new Set<string>();
    const names = ["Alpha", "Beta", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel"];
    for (const name of names) {
      const passport = createMockPassport({ name, description: "A test agent description." });
      colors.add(passport.badgeColor);
    }
    // With 8 names and 5 colors, we expect more than 1 unique color
    expect(colors.size).toBeGreaterThan(1);
  });

  it("includes domain in generated text when provided", () => {
    const passport = createMockPassport({ ...baseInput, domain: "trading" });
    const allText = [passport.oneLiner, ...passport.capabilities, passport.signatureStyle].join(" ");
    expect(allText.toLowerCase()).toContain("trading");
  });

  it("uses 'general' in text when domain is not provided", () => {
    const passport = createMockPassport(baseInput);
    const allText = [passport.oneLiner, ...passport.capabilities, passport.signatureStyle].join(" ");
    expect(allText.toLowerCase()).toContain("general");
  });

  it("returns a valid operatorType", () => {
    const validTypes = ["solo", "team", "protocol"];
    const passport = createMockPassport(baseInput);
    expect(validTypes).toContain(passport.operatorType);
  });

  it("all string fields are non-empty", () => {
    const passport = createMockPassport(baseInput);
    expect(passport.name.length).toBeGreaterThan(0);
    expect(passport.oneLiner.length).toBeGreaterThan(0);
    expect(passport.mission.length).toBeGreaterThan(0);
    expect(passport.signatureStyle.length).toBeGreaterThan(0);
  });
});
