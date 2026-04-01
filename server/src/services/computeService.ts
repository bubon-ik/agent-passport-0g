import OpenAI from "openai";
import { config, computeConfigured } from "../config.js";
import { AppError } from "../errors.js";
import { createMockPassport } from "../mockPassport.js";
import { normalizePassport } from "../normalizePassport.js";
import { buildPassportPrompt } from "../passportPrompt.js";
import type { AgentPassport, GeneratePassportInput } from "../../../shared/passport.js";

const client = computeConfigured
  ? new OpenAI({ apiKey: config.computeApiKey, baseURL: config.computeBaseUrl })
  : null;

function extractJson(text: string) {
  const trimmed = text.trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Model did not return JSON.");
  }

  return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
}

export async function generatePassport(input: GeneratePassportInput): Promise<{
  passport: AgentPassport;
  mode: "live" | "mock";
}> {
  const fallback = createMockPassport(input);

  if (!computeConfigured) {
    if (!config.allowMock) {
      throw new AppError("0G Compute is not configured.", 503);
    }

    return {
      passport: fallback,
      mode: "mock"
    };
  }

  try {
    const completion = await client!.chat.completions.create({
      model: config.computeModel,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You design public identity passports for AI agents. Output only JSON."
        },
        {
          role: "user",
          content: buildPassportPrompt(input)
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty model response.");
    }

    return {
      passport: normalizePassport(extractJson(content), fallback),
      mode: "live"
    };
  } catch (error) {
    if (!config.allowMock) {
      throw new AppError(
        error instanceof Error ? `Compute request failed: ${error.message}` : "Compute request failed.",
        502
      );
    }

    return {
      passport: fallback,
      mode: "mock"
    };
  }
}
