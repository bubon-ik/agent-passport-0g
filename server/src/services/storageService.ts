import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ethers } from "ethers";
import { Indexer, MemData } from "@0gfoundation/0g-ts-sdk";
import { config, storageConfigured } from "../config.js";
import { AppError } from "../errors.js";
import type { AgentPassport } from "../../../shared/passport.js";

type SaveResult = {
  rootHash: string;
  txHash?: string;
  savedAt: string;
  mode: "live" | "mock";
};

type RetryOpts = {
  Retries: number;
  Interval: number;
  MaxGasPrice: number;
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
  const artifactRoot = process.env.VERCEL ? os.tmpdir() : process.cwd();
  const artifactsDir = path.resolve(artifactRoot, ".demo-artifacts");

  try {
    await mkdir(artifactsDir, { recursive: true });

    const artifactPath = path.join(artifactsDir, `${rootHash}.json`);
    await writeFile(artifactPath, payload, "utf8");

    return artifactPath;
  } catch (error) {
    console.warn(
      "[storageService] fallback artifact write skipped:",
      error instanceof Error ? error.message : error
    );

    return undefined;
  }
}

function buildRetryOpts(): RetryOpts | undefined {
  if (!config.maxRetries) {
    return undefined;
  }

  return {
    Retries: config.maxRetries,
    Interval: 5,
    MaxGasPrice: config.maxGasPrice ? Number(config.maxGasPrice) : 0
  };
}

function buildTxOpts() {
  const txOpts: { gasPrice?: bigint; gasLimit?: bigint } = {};

  if (config.gasPrice) {
    txOpts.gasPrice = config.gasPrice;
  }

  if (config.gasLimit) {
    txOpts.gasLimit = config.gasLimit;
  }

  return Object.keys(txOpts).length > 0 ? txOpts : undefined;
}

export async function savePassport(passport: AgentPassport): Promise<SaveResult> {
  const savedAt = new Date().toISOString();
  const payload = buildPayload(passport, savedAt);
  const { file, treeRoot } = await buildFile(payload);

  if (!storageConfigured) {
    if (!config.allowMock) {
      throw new AppError("0G Storage is not configured.", 503);
    }

    await writeFallbackArtifact(treeRoot, payload);

    return {
      rootHash: treeRoot,
      savedAt,
      mode: "mock"
    };
  }

  try {
    const provider = new ethers.JsonRpcProvider(config.storageRpc);
    const wallet = new ethers.Wallet(config.privateKey, provider);
    const indexer = new Indexer(config.storageIndexer);
    const signer = wallet as unknown as Parameters<Indexer["upload"]>[2];
    const [tx, uploadError] = await indexer.upload(
      file,
      config.storageRpc,
      signer,
      undefined,
      buildRetryOpts(),
      buildTxOpts()
    );

    if (uploadError || !tx) {
      throw uploadError ?? new Error("Missing upload transaction payload.");
    }

    const liveResult =
      "rootHash" in tx
        ? { rootHash: tx.rootHash, txHash: tx.txHash }
        : { rootHash: tx.rootHashes[0], txHash: tx.txHashes[0] };

    return {
      rootHash: liveResult.rootHash || treeRoot,
      txHash: liveResult.txHash,
      savedAt,
      mode: "live"
    };
  } catch (error) {
    console.error("[storageService] upload failed:", error instanceof Error ? error.message : error);

    if (!config.allowMock) {
      throw new AppError(
        error instanceof Error ? `Storage upload failed: ${error.message}` : "Storage upload failed.",
        502
      );
    }

    await writeFallbackArtifact(treeRoot, payload);

    return {
      rootHash: treeRoot,
      savedAt,
      mode: "mock"
    };
  }
}
