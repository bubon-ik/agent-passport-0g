import { useState } from "react";
import { savePassport } from "../api";
import type { AgentPassport } from "../../../shared/passport";

export type StorageState = {
  rootHash: string;
  savedAt: string;
  saveMode: "live" | "mock" | null;
  isSaving: boolean;
  copied: boolean;
  saveError: string;
  onSave: (passport: AgentPassport) => Promise<void>;
  copyHash: () => Promise<void>;
  reset: () => void;
};

export function usePassportStorage(): StorageState {
  const [rootHash, setRootHash] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const [saveMode, setSaveMode] = useState<"live" | "mock" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function onSave(passport: AgentPassport) {
    setIsSaving(true);
    setSaveError("");
    setCopied(false);

    try {
      const result = await savePassport(passport);
      setRootHash(result.rootHash);
      setSavedAt(result.savedAt);
      setSaveMode(result.mode);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Storage failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function copyHash() {
    if (!rootHash) return;

    try {
      await navigator.clipboard.writeText(rootHash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setSaveError("Could not copy to clipboard.");
    }
  }

  function reset() {
    setRootHash("");
    setSavedAt("");
    setSaveMode(null);
    setSaveError("");
    setCopied(false);
  }

  return {
    rootHash,
    savedAt,
    saveMode,
    isSaving,
    copied,
    saveError,
    onSave,
    copyHash,
    reset
  };
}
