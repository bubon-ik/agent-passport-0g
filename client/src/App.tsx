import { FormEvent, useEffect, useState } from "react";
import { generatePassport, getHealth, savePassport } from "./api";
import type { AgentPassport, DomainOption, HealthResponse } from "./types";

const domains: DomainOption[] = ["research", "trading", "support", "content", "security"];

const badgeLabels: Record<AgentPassport["badgeColor"], string> = {
  copper: "Copper",
  lime: "Lime",
  cyan: "Cyan",
  amber: "Amber",
  rose: "Rose"
};

function PassportCard({ passport, savedRootHash }: { passport: AgentPassport; savedRootHash?: string }) {
  return (
    <section className={`passport-card badge-${passport.badgeColor}`}>
      <div className="passport-topline">
        <span>Agent Passport</span>
        <span>{badgeLabels[passport.badgeColor]} tier</span>
      </div>
      <div className="passport-name-row">
        <div>
          <p className="passport-kicker">Portable identity capsule</p>
          <h2>{passport.name}</h2>
        </div>
        <div className="passport-chip">{passport.operatorType}</div>
      </div>
      <p className="passport-one-liner">{passport.oneLiner}</p>
      <div className="passport-grid">
        <div>
          <span className="label">Mission</span>
          <p>{passport.mission}</p>
        </div>
        <div>
          <span className="label">Trust Profile</span>
          <p>{passport.trustProfile}</p>
        </div>
        <div>
          <span className="label">Signature Style</span>
          <p>{passport.signatureStyle}</p>
        </div>
        <div>
          <span className="label">Stored Root</span>
          <p className="mono">{savedRootHash ? savedRootHash : "Not stored yet"}</p>
        </div>
      </div>
    </section>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="detail-block">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<DomainOption | "">("");
  const [passport, setPassport] = useState<AgentPassport | null>(null);
  const [generateMode, setGenerateMode] = useState<"live" | "mock" | null>(null);
  const [saveMode, setSaveMode] = useState<"live" | "mock" | null>(null);
  const [rootHash, setRootHash] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const [artifactPath, setArtifactPath] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => null);
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setRootHash("");
    setSavedAt("");
    setSaveMode(null);
    setArtifactPath("");
    setCopied(false);

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
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSave() {
    if (!passport) return;

    setIsSaving(true);
    setError("");

    try {
      const result = await savePassport(passport);
      setRootHash(result.rootHash);
      setSavedAt(result.savedAt);
      setSaveMode(result.mode);
      setArtifactPath(result.artifactPath || "");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Storage failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function copyHash() {
    if (!rootHash) return;
    await navigator.clipboard.writeText(rootHash);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">0G Vibe Coding MVP</p>
          <h1>Portable public identity cards for AI agents.</h1>
          <p className="lede">
            Agent Passport turns a raw agent brief into a structured public profile using 0G
            Compute, then stores the capsule on 0G.
          </p>
          <div className="status-row">
            <span className={`status-pill ${health?.computeConfigured ? "ok" : "warn"}`}>
              Compute {health?.computeConfigured ? "configured" : "demo mode"}
            </span>
            <span className={`status-pill ${health?.storageConfigured ? "ok" : "warn"}`}>
              Storage {health?.storageConfigured ? "configured" : "demo mode"}
            </span>
          </div>
        </div>
        <div className="hero-aside">
          <div className="frame-line" />
          <p>Security credential meets sci-fi identity artifact.</p>
          <span>One brief. One passport. One stored proof.</span>
        </div>
      </section>

      <section className="workspace">
        <form className="panel form-panel" onSubmit={onSubmit}>
          <div className="panel-header">
            <p>Passport Generator</p>
            <span>Build an agent identity primitive</span>
          </div>

          <label>
            Agent name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Negravis Sentinel"
              maxLength={48}
            />
          </label>

          <label>
            Agent description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what the agent does, who operates it, and where it should be trusted."
              rows={7}
              maxLength={700}
            />
          </label>

          <label>
            Primary domain
            <select value={domain} onChange={(event) => setDomain(event.target.value as DomainOption | "")}>
              <option value="">Unspecified</option>
              {domains.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button className="primary-button" type="submit" disabled={isGenerating}>
            {isGenerating ? "Generating passport..." : "Generate Passport"}
          </button>

          {error ? <p className="error-text">{error}</p> : null}
          {generateMode ? (
            <p className="hint-text">
              Generated via {generateMode === "live" ? "0G Compute" : "demo fallback"}.
            </p>
          ) : (
            <p className="hint-text">Keep the brief concrete. The sharper the brief, the sharper the passport.</p>
          )}
        </form>

        <div className="panel output-panel">
          {passport ? (
            <>
              <PassportCard passport={passport} savedRootHash={rootHash} />

              <div className="detail-grid">
                <DetailList title="Capabilities" items={passport.capabilities} />
                <DetailList title="Best Use Cases" items={passport.bestUseCases} />
                <DetailList title="Risk Notes" items={passport.riskNotes} />
              </div>

              <div className="storage-panel">
                <div>
                  <p className="storage-title">0G Storage</p>
                  <p className="storage-copy">
                    Save the passport as a reusable artifact and surface its root hash for the demo.
                  </p>
                </div>

                <div className="storage-actions">
                  <button className="secondary-button" onClick={onSave} disabled={isSaving} type="button">
                    {isSaving ? "Storing..." : "Save to 0G"}
                  </button>
                  <button
                    className="ghost-button"
                    onClick={copyHash}
                    disabled={!rootHash}
                    type="button"
                  >
                    {copied ? "Copied" : "Copy Root Hash"}
                  </button>
                </div>

                {rootHash ? (
                  <div className="storage-result">
                    <p className="storage-badge">
                      Stored on {saveMode === "live" ? "0G" : "demo fallback"}
                    </p>
                    <p className="mono">{rootHash}</p>
                    <p className="storage-meta">Saved at {new Date(savedAt).toLocaleString()}</p>
                    {artifactPath ? <p className="storage-meta">Fallback artifact: {artifactPath}</p> : null}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p className="empty-kicker">Agent identity capsule</p>
              <h2>Generate a passport that looks ready to circulate.</h2>
              <p>
                The output is not a chat answer. It is a public-facing capability card with a
                trust profile, operating posture, risks, and a storage-ready identity artifact.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
