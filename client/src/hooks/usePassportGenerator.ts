import { FormEvent, useState } from "react";
import { generatePassport } from "../api";
import type { AgentPassport } from "../../../shared/passport";
import type { DomainOption } from "../types";

export type GeneratorState = {
  name: string;
  description: string;
  domain: DomainOption | "";
  passport: AgentPassport | null;
  generateMode: "live" | "mock" | null;
  isGenerating: boolean;
  error: string;
  setName: (v: string) => void;
  setDescription: (v: string) => void;
  setDomain: (v: DomainOption | "") => void;
  onSubmit: (event: FormEvent) => Promise<void>;
};

export function usePassportGenerator(): GeneratorState {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<DomainOption | "">("");
  const [passport, setPassport] = useState<AgentPassport | null>(null);
  const [generateMode, setGenerateMode] = useState<"live" | "mock" | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !description.trim()) {
      setError("Agent name and description are required.");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generatePassport({
        name: name.trim(),
        description: description.trim(),
        domain: domain || undefined
      });

      setPassport(result.passport);
      setGenerateMode(result.mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  return {
    name,
    description,
    domain,
    passport,
    generateMode,
    isGenerating,
    error,
    setName,
    setDescription,
    setDomain,
    onSubmit
  };
}
