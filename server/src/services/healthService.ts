import { ethers } from "ethers";
import { config, computeConfigured, storageConfigured } from "../config.js";

const RPC_PING_TIMEOUT_MS = 3000;

/**
 * Checks whether the storage RPC responds within the timeout.
 * Uses eth_chainId — the lightest call available.
 */
export async function pingStorageRpc(): Promise<boolean> {
  if (!storageConfigured) return false;

  try {
    const provider = new ethers.JsonRpcProvider(config.storageRpc);
    const networkPromise = provider.getNetwork();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), RPC_PING_TIMEOUT_MS)
    );
    await Promise.race([networkPromise, timeoutPromise]);
    return true;
  } catch {
    return false;
  }
}

export type HealthResult = {
  ok: boolean;
  computeConfigured: boolean;
  storageConfigured: boolean;
  storageReachable: boolean;
};

export async function checkHealth(): Promise<HealthResult> {
  const storageReachable = await pingStorageRpc();
  return {
    ok: true,
    computeConfigured,
    storageConfigured,
    storageReachable
  };
}
