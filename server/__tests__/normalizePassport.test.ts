import { describe, it, expect } from "vitest";
import { normalizePassport } from "../../server/src/normalizePassport.js";
import type { AgentPassport } from "../../shared/passport.js";

const baseFallback: AgentPassport = {
  name: "FallbackAgent",
  oneLiner: "A fallback agent for testing purposes.",
  mission: "Provide reliable test data when primary inputs are missing.",
  capabilities: ["Read data efficiently", "Process structured inputs", "Output clean results"],
  bestUseCases: ["Unit testing", "Integration testing", "Demo environments"],
  riskNotes: ["Not for production use", "Requires human review"],
  trustProfile: "experimental",
  operatorType: "solo",
  signatureStyle: "minimal operator",
  badgeColor: "cyan"
};

describe("normalizePassport", () => {
  it("returns a valid passport from a fully correct input", () => {
    const input: AgentPassport = {
      name: "AlphaBot",
      oneLiner: "A trading agent that executes DeFi strategies.",
      mission: "Execute trades with minimal slippage on decentralized exchanges.",
      capabilities: ["Analyzes market conditions", "Executes swaps on-chain", "Reports P&L"],
      bestUseCases: ["DeFi trading", "Yield optimization", "Portfolio rebalancing"],
      riskNotes: ["High-value actions require human sign-off", "Market conditions can change fast"],
      trustProfile: "practical",
      operatorType: "team",
      signatureStyle: "systematic executor",
      badgeColor: "amber"
    };

    const result = normalizePassport(input, baseFallback);

    expect(result.name).toBe("AlphaBot");
    expect(result.trustProfile).toBe("practical");
    expect(result.badgeColor).toBe("amber");
    expect(result.capabilities).toHaveLength(3);
    expect(result.riskNotes).toHaveLength(2);
  });

  it("falls back to fallback values when candidate is null", () => {
    const result = normalizePassport(null, baseFallback);
    expect(result.name).toBe(baseFallback.name);
    expect(result.trustProfile).toBe(baseFallback.trustProfile);
    expect(result.badgeColor).toBe(baseFallback.badgeColor);
  });

  it("falls back to fallback values when candidate is undefined", () => {
    const result = normalizePassport(undefined, baseFallback);
    expect(result.name).toBe(baseFallback.name);
  });

  it("falls back to fallback values when candidate is a plain empty object", () => {
    const result = normalizePassport({}, baseFallback);
    expect(result.name).toBe(baseFallback.name);
    expect(result.capabilities).toEqual(baseFallback.capabilities.slice(0, 3));
  });

  it("clamps strings that exceed maximum length", () => {
    const longName = "A".repeat(200);
    const result = normalizePassport({ ...baseFallback, name: longName }, baseFallback);
    expect(result.name.length).toBeLessThanOrEqual(48);
  });

  it("rejects invalid trustProfile and falls back", () => {
    const result = normalizePassport(
      { ...baseFallback, trustProfile: "god-mode" },
      baseFallback
    );
    expect(result.trustProfile).toBe(baseFallback.trustProfile);
  });

  it("rejects invalid badgeColor and falls back", () => {
    const result = normalizePassport(
      { ...baseFallback, badgeColor: "purple" },
      baseFallback
    );
    expect(result.badgeColor).toBe(baseFallback.badgeColor);
  });

  it("rejects invalid operatorType and falls back", () => {
    const result = normalizePassport(
      { ...baseFallback, operatorType: "singleton" },
      baseFallback
    );
    expect(result.operatorType).toBe(baseFallback.operatorType);
  });

  it("pads short capability arrays with fallback items", () => {
    const result = normalizePassport(
      { ...baseFallback, capabilities: ["Only one item"] },
      baseFallback
    );
    expect(result.capabilities).toHaveLength(3);
    expect(result.capabilities[0]).toBe("Only one item");
    // normalizeArray appends fallback from index 0 after the provided items
    expect(result.capabilities[1]).toBe(baseFallback.capabilities[0]);
    expect(result.capabilities[2]).toBe(baseFallback.capabilities[1]);
  });

  it("truncates capability arrays longer than 3", () => {
    const result = normalizePassport(
      {
        ...baseFallback,
        capabilities: ["Cap A", "Cap B", "Cap C", "Cap D", "Cap E"]
      },
      baseFallback
    );
    expect(result.capabilities).toHaveLength(3);
  });

  it("trims whitespace from string fields", () => {
    const result = normalizePassport(
      { ...baseFallback, name: "  TrimMe  " },
      baseFallback
    );
    expect(result.name).toBe("TrimMe");
  });

  it("handles non-object candidate gracefully", () => {
    expect(() => normalizePassport(42, baseFallback)).not.toThrow();
    expect(() => normalizePassport("string", baseFallback)).not.toThrow();
    expect(() => normalizePassport(true, baseFallback)).not.toThrow();
  });
});
