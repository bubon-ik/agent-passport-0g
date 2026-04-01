import dotenv from "dotenv";

dotenv.config();

const INDEXER_URLS = {
  testnet: {
    turbo: "https://indexer-storage-testnet-turbo.0g.ai",
    standard: "https://indexer-storage-testnet-standard.0g.ai"
  },
  mainnet: {
    turbo: "https://indexer-storage-turbo.0g.ai",
    standard: "https://indexer-storage.0g.ai"
  }
} as const;

const NETWORKS = {
  testnet: {
    rpcUrl: "https://evmrpc-testnet.0g.ai",
    chainId: 16602,
    explorerUrl: "https://chainscan-galileo.0g.ai"
  },
  mainnet: {
    rpcUrl: "https://evmrpc.0g.ai",
    chainId: 16661,
    explorerUrl: "https://chainscan.0g.ai"
  }
} as const;

type StorageNetworkName = keyof typeof NETWORKS;
type StorageMode = keyof (typeof INDEXER_URLS)[StorageNetworkName];

function resolveStorageNetwork(): StorageNetworkName {
  const network = (process.env.NETWORK || "testnet").toLowerCase();
  return network === "mainnet" ? "mainnet" : "testnet";
}

function resolveStorageMode(): StorageMode {
  const mode = (process.env.STORAGE_MODE || "turbo").toLowerCase();
  return mode === "standard" ? "standard" : "turbo";
}

const storageNetwork = resolveStorageNetwork();
const storageMode = resolveStorageMode();
const derivedStorageRpc = NETWORKS[storageNetwork].rpcUrl;
const derivedStorageIndexer = INDEXER_URLS[storageNetwork][storageMode];

export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  allowMock: process.env.ALLOW_MOCK_MODE !== "false",
  corsOrigin: process.env.CORS_ORIGIN as string | undefined,
  computeBaseUrl: process.env.ZG_COMPUTE_BASE_URL || process.env.OPENAI_BASE_URL || "",
  computeModel: process.env.ZG_COMPUTE_MODEL || "llama-3.3-70b-instruct",
  computeApiKey: process.env.ZG_COMPUTE_API_KEY || process.env.OPENAI_API_KEY || "unused",
  storageNetwork,
  storageMode,
  storageChainId: NETWORKS[storageNetwork].chainId,
  storageExplorerUrl: NETWORKS[storageNetwork].explorerUrl,
  storageRpc: process.env.ZG_STORAGE_RPC || derivedStorageRpc,
  storageIndexer: process.env.ZG_STORAGE_INDEXER || derivedStorageIndexer,
  privateKey: process.env.ZG_PRIVATE_KEY || process.env.PRIVATE_KEY || "",
  gasPrice: process.env.GAS_PRICE ? BigInt(process.env.GAS_PRICE) : undefined,
  gasLimit: process.env.GAS_LIMIT ? BigInt(process.env.GAS_LIMIT) : undefined,
  maxRetries: process.env.MAX_RETRIES ? Number.parseInt(process.env.MAX_RETRIES, 10) : undefined,
  maxGasPrice: process.env.MAX_GAS_PRICE ? BigInt(process.env.MAX_GAS_PRICE) : undefined
};

export const computeConfigured = Boolean(config.computeBaseUrl);
export const storageConfigured = Boolean(
  config.privateKey && config.storageRpc && config.storageIndexer
);
