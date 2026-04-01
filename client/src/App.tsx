import { useEffect, useState } from "react";
import { getHealth } from "./api";
import { usePassportGenerator } from "./hooks/usePassportGenerator";
import { usePassportStorage } from "./hooks/usePassportStorage";
import type { AgentPassport } from "../../shared/passport";
import type { DomainOption, HealthResponse } from "./types";

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
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const generator = usePassportGenerator();
  const storage = usePassportStorage();

  useEffect(() => {
    getHealth().then(setHealth).catch(() => null);
  }, []);

  useEffect(() => {
    if (generator.passport) {
      storage.reset();
    }
  }, [generator.passport]);

  const combinedError = generator.error || storage.saveError;

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
              Compute {health?.computeConfigured ? "endpoint set" : "demo mode"}
            </span>
            <span className={`status-pill ${health?.storageConfigured ? "ok" : "warn"}`}>
              Storage {health?.storageConfigured ? "wallet set" : "demo mode"}
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
        <form className="panel form-panel" onSubmit={generator.onSubmit}>
          <div className="panel-header">
            <p>Passport Generator</p>
            <span>Build an agent identity primitive</span>
          </div>

          <label>
            Agent name
            <input
              value={generator.name}
              onChange={(e) => generator.setName(e.target.value)}
              placeholder="Negravis Sentinel"
              maxLength={48}
            />
          </label>

          <label>
            Agent description
            <textarea
              value={generator.description}
              onChange={(e) => generator.setDescription(e.target.value)}
              placeholder="Describe what the agent does, who operates it, and where it should be trusted."
              rows={7}
              maxLength={700}
            />
          </label>

          <label>
            Primary domain
            <select
              value={generator.domain}
              onChange={(e) => generator.setDomain(e.target.value as DomainOption | "")}
            >
              <option value="">Unspecified</option>
              {domains.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button className="primary-button" type="submit" disabled={generator.isGenerating}>
            {generator.isGenerating ? "Generating passport..." : "Generate Passport"}
          </button>

          {combinedError ? <p className="error-text">{combinedError}</p> : null}
          {generator.generateMode ? (
            <p className="hint-text">
              Generated via {generator.generateMode === "live" ? "0G Compute" : "demo mode"}.
            </p>
          ) : (
            <p className="hint-text">Keep the brief concrete. The sharper the brief, the sharper the passport.</p>
          )}
        </form>

        <div className="panel output-panel">
          {generator.passport ? (
            <>
              <PassportCard passport={generator.passport} savedRootHash={storage.rootHash} />

              <div className="detail-grid">
                <DetailList title="Capabilities" items={generator.passport.capabilities} />
                <DetailList title="Best Use Cases" items={generator.passport.bestUseCases} />
                <DetailList title="Risk Notes" items={generator.passport.riskNotes} />
              </div>

              <div className="storage-panel">
                <div>
                  <p className="storage-title">0G Storage</p>
                  <p className="storage-copy">
                    Save the passport as a reusable artifact and surface its root hash for the demo.
                  </p>
                </div>

                <div className="storage-actions">
                  <button
                    className="secondary-button"
                    onClick={() => generator.passport && storage.onSave(generator.passport)}
                    disabled={storage.isSaving}
                    type="button"
                  >
                    {storage.isSaving ? "Storing..." : "Save to 0G"}
                  </button>
                  <button
                    className="ghost-button"
                    onClick={storage.copyHash}
                    disabled={!storage.rootHash}
                    type="button"
                  >
                    {storage.copied ? "Copied" : "Copy Root Hash"}
                  </button>
                </div>

                {storage.rootHash ? (
                  <div className="storage-result">
                    <p className="storage-badge">
                      {storage.saveMode === "live" ? "Stored on 0G" : "Stored in demo-safe mode"}
                    </p>
                    <p className="mono">{storage.rootHash}</p>
                    <p className="storage-meta">Saved at {new Date(storage.savedAt).toLocaleString()}</p>
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
