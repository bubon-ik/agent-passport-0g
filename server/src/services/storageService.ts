import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ethers } from "ethers";
import {
  Indexer,
  MemData,
  defaultUploadOption,
  type UploadOption
} from "@0glabs/0g-ts-sdk";
import { config, storageConfigured } from "../config.js";
import { AppError } from "../errors.js";
import type { AgentPassport } from "../../../shared/passport.js";

type SaveResult = {
  rootHash: string;
  txHash?: string;
  savedAt: string;
  mode: "live" | "mock";
  artifactPath?: string;
};

function buildPayload(passport: AgentPassport, savedAt: string) {
  return JSON.stringify(
    {
      version: 1,
      kind: "agent-passport",
      savedAt,
      passport
    },
    null,
    2
  );
}

async function buildFile(payload: string) {
  const file = new MemData(Buffer.from(payload, "utf8"));
  const [tree, treeError] = await file.merkleTree();

  if (treeError || !tree) {
    throw treeError ?? new Error("Failed to compute Merkle tree.");
  }

  const treeRoot = tree.rootHash();

  if (!treeRoot) {
    throw new Error("Merkle root hash is empty.");
  }

  return { file, treeRoot };
}

async function writeFallbackArtifact(rootHash: string, payload: string) {
  const artifactsDir = path.resolve(process.cwd(), ".demo-artifacts");
  await mkdir(artifactsDir, { recursive: true });

  const artifactPath = path.join(artifactsDir, `${rootHash}.json`);
  await writeFile(artifactPath, payload, "utf8");

  return artifactPath;
}

export async function savePassport(passport: AgentPassport): Promise<SaveResult> {
  const savedAt = new Date().toISOString();
  const payload = buildPayload(passport, savedAt);
  const { file, treeRoot } = await buildFile(payload);

  if (!storageConfigured) {
    if (!config.allowMock) {
      throw new AppError("0G Storage is not configured.", 503);
    }

    const artifactPath = await writeFallbackArtifact(treeRoot, payload);

    return {
      rootHash: treeRoot,
      savedAt,
      mode: "mock",
      artifactPath
    };
  }

  try {
    const provider = new ethers.JsonRpcProvider(config.storageRpc);
    const wallet = new ethers.Wallet(config.privateKey, provider);
    const indexer = new Indexer(config.storageIndexer);
    const uploadOptions: UploadOption = {
      ...defaultUploadOption,
      taskSize: 10,
      expectedReplica: 1,
      finalityRequired: true,
      tags: "0x",
      skipTx: false,
      fee: BigInt(0)
    };

    const [nodes, nodesError] = await indexer.selectNodes(uploadOptions.expectedReplica);
    if (nodesError || nodes.length === 0) {
      throw nodesError ?? new Error("Failed to select storage nodes.");
    }

    const signer = wallet as unknown as Parameters<Indexer["upload"]>[2];
    const [tx, uploadError] = await indexer.upload(file, config.storageRpc, signer, uploadOptions);

    if (uploadError || !tx) {
      throw uploadError ?? new Error("Missing upload transaction payload.");
    }

    return {
      rootHash: treeRoot,
      txHash: tx.txHash,
      savedAt,
      mode: "live"
    };
  } catch (error) {
    if (!config.allowMock) {
      throw new AppError(
        error instanceof Error ? `Storage upload failed: ${error.message}` : "Storage upload failed.",
        502
      );
    }

    const artifactPath = await writeFallbackArtifact(treeRoot, payload);

    return {
      rootHash: treeRoot,
      savedAt,
      mode: "mock",
      artifactPath
    };
  }
}
