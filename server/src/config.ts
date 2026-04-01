import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  allowMock: process.env.ALLOW_MOCK_MODE !== "false",
  computeBaseUrl: process.env.ZG_COMPUTE_BASE_URL || process.env.OPENAI_BASE_URL || "",
  computeModel: process.env.ZG_COMPUTE_MODEL || "llama-3.3-70b-instruct",
  computeApiKey: process.env.ZG_COMPUTE_API_KEY || process.env.OPENAI_API_KEY || "unused",
  storageRpc: process.env.ZG_STORAGE_RPC || "https://evmrpc.0g.ai",
  storageIndexer: process.env.ZG_STORAGE_INDEXER || "https://indexer-storage-turbo.0g.ai",
  privateKey: process.env.ZG_PRIVATE_KEY || process.env.PRIVATE_KEY || ""
};

export const computeConfigured = Boolean(config.computeBaseUrl);
export const storageConfigured = Boolean(
  config.privateKey && config.storageRpc && config.storageIndexer
);
