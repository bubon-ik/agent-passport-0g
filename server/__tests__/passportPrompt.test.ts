import { describe, it, expect } from "vitest";
import { buildPassportPrompt } from "../../server/src/passportPrompt.js";
import type { GeneratePassportInput } from "../../shared/passport.js";

describe("buildPassportPrompt", () => {
  it("includes agent name in the output", () => {
    const input: GeneratePassportInput = {
      name: "AlphaBot",
      description: "A DeFi trading agent operating on Base."
    };
    const prompt = buildPassportPrompt(input);
    expect(prompt).toContain("AlphaBot");
  });

  it("includes description in the output", () => {
    const input: GeneratePassportInput = {
      name: "AlphaBot",
      description: "A DeFi trading agent operating on Base."
    };
    const prompt = buildPassportPrompt(input);
    expect(prompt).toContain("A DeFi trading agent operating on Base.");
  });

  it("shows 'unspecified' when domain is not provided", () => {
    const input: GeneratePassportInput = {
      name: "AlphaBot",
      description: "Some description long enough."
    };
    const prompt = buildPassportPrompt(input);
    expect(prompt).toContain("unspecified");
  });

  it("shows the domain when provided", () => {
    const input: GeneratePassportInput = {
      name: "TradeBot",
      description: "Executes automated DeFi strategies on behalf of operators.",
      domain: "trading"
    };
    const prompt = buildPassportPrompt(input);
    expect(prompt).toContain("trading");
    expect(prompt).not.toContain("unspecified");
  });

  it("instructs the model to return JSON only", () => {
    const prompt = buildPassportPrompt({
      name: "Bot",
      description: "A generic bot for general operations."
    });
    expect(prompt).toContain("Return JSON only");
  });

  it("lists all required keys in the prompt", () => {
    const prompt = buildPassportPrompt({
      name: "Bot",
      description: "A generic bot for general operations."
    });
    const requiredKeys = [
      "name",
      "oneLiner",
      "mission",
      "capabilities",
      "bestUseCases",
      "riskNotes",
      "trustProfile",
      "operatorType",
      "signatureStyle",
      "badgeColor"
    ];
    for (const key of requiredKeys) {
      expect(prompt).toContain(key);
    }
  });

  it("specifies correct array lengths in the prompt", () => {
    const prompt = buildPassportPrompt({
      name: "Bot",
      description: "A generic bot for general operations."
    });
    expect(prompt).toContain("exactly 3");
    expect(prompt).toContain("exactly 2");
  });

  it("produces a non-empty string", () => {
    const prompt = buildPassportPrompt({
      name: "Bot",
      description: "A generic bot for general operations."
    });
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });
});
