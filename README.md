# Agent Passport

Agent Passport is a one-page app built for the 0G vibe coding hackathon.

The product takes a short AI agent brief and turns it into a structured public identity card:

- product-style one-liner
- mission
- capabilities
- best use cases
- risk notes
- trust profile
- operator type
- signature style

After generation, the passport can be saved as a storage artifact and surfaced with a root hash.

## Why This Exists

Most AI agent demos stop at a prompt and a blob of text.

Agent Passport packages an agent as something more legible and reusable: a public-facing identity artifact that can be shown to judges, builders, or users without requiring them to read an unstructured chat response.

In short:

- input: raw agent description
- output: portable public identity card

## What The App Does

The app has a simple flow:

1. Enter an agent name.
2. Add a short description of what the agent does.
3. Optionally choose a primary domain.
4. Generate a passport.
5. Save the passport as a storage artifact.

The frontend is designed as a single-screen demo:

- left side: input form
- right side: generated passport card
- lower section: capabilities, use cases, risk notes, and storage actions

## Stack

- Vite
- React
- TypeScript
- Express
- Zod
- OpenAI-compatible compute endpoint for 0G Compute integration
- `@0gfoundation/0g-ts-sdk` for 0G Storage

## Project Structure

```text
client/
  src/
    App.tsx
    api.ts
    hooks/
server/
  src/
    config.ts
    services/
shared/
  passport.ts
api/
  health.ts
  passport/
    generate.ts
    save.ts
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create the environment file

```bash
cp .env.example .env
```

### 3. Fill in `.env`

At minimum, set the values you actually want to use.

If you only want to run the app in demo mode, you can leave the 0G credentials empty and keep:

```env
ALLOW_MOCK_MODE=true
```

### 4. Start the app

```bash
npm run dev
```

This starts:

- Vite frontend on `http://localhost:5173`
- Express backend on `http://localhost:4000`

Vite proxies `/api/*` to the backend during local development.

## Environment Variables

The project supports both demo mode and live 0G integrations.

### Core app

```env
PORT=4000
NODE_ENV=development
ALLOW_MOCK_MODE=true
```

### 0G Compute

```env
ZG_COMPUTE_BASE_URL=
ZG_COMPUTE_API_KEY=
ZG_COMPUTE_MODEL=llama-3.3-70b-instruct
```

### 0G Storage

The storage config follows the official 0G storage starter-kit shape:

```env
NETWORK=testnet
STORAGE_MODE=turbo
PRIVATE_KEY=
```

Optional overrides:

```env
# ZG_STORAGE_RPC=https://evmrpc-testnet.0g.ai
# ZG_STORAGE_INDEXER=https://indexer-storage-testnet-turbo.0g.ai
# ZG_PRIVATE_KEY=
```

Optional gas and retry settings:

```env
# GAS_PRICE=3000000000000
# GAS_LIMIT=2000000
# MAX_RETRIES=3
# MAX_GAS_PRICE=3000000000000
```

## Scripts

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run test
npm run typecheck
npm run build
```

## API Endpoints

### `GET /api/health`

Returns service health metadata:

- `computeConfigured`
- `storageConfigured`
- `storageReachable`

### `POST /api/passport/generate`

Request:

```json
{
  "name": "Sentinel Atlas",
  "description": "An AI operations agent for Web3 teams...",
  "domain": "security"
}
```

Response:

```json
{
  "passport": {
    "name": "Sentinel Atlas",
    "oneLiner": "...",
    "mission": "...",
    "capabilities": ["...", "...", "..."],
    "bestUseCases": ["...", "...", "..."],
    "riskNotes": ["...", "..."],
    "trustProfile": "practical",
    "operatorType": "team",
    "signatureStyle": "...",
    "badgeColor": "amber"
  },
  "mode": "live"
}
```

### `POST /api/passport/save`

Request:

```json
{
  "passport": {
    "name": "Sentinel Atlas",
    "oneLiner": "...",
    "mission": "...",
    "capabilities": ["...", "...", "..."],
    "bestUseCases": ["...", "...", "..."],
    "riskNotes": ["...", "..."],
    "trustProfile": "practical",
    "operatorType": "team",
    "signatureStyle": "...",
    "badgeColor": "amber"
  }
}
```

Response:

```json
{
  "rootHash": "0x...",
  "txHash": "0x...",
  "savedAt": "2026-04-01T13:14:42.968Z",
  "mode": "live"
}
```

If live storage is unavailable and `ALLOW_MOCK_MODE=true`, the endpoint falls back to demo-safe mode and still returns a deterministic artifact root hash.

## Demo Mode vs Live Mode

The app is intentionally resilient for hackathon use.

### Demo mode

If 0G credentials are missing or a live call fails and `ALLOW_MOCK_MODE=true`, the app stays usable:

- generation falls back to a deterministic mock passport
- storage falls back to a demo-safe artifact flow

### Live mode

If compute and storage credentials are configured correctly, the app uses live 0G integrations.

## Verification

Run:

```bash
npm run test
npm run typecheck
npm run build
```

At the time of the latest update:

- tests pass
- typecheck passes
- build passes

## Notes

- Do not commit real private keys or API keys.
- `.env` is ignored by git.
- `.demo-artifacts` is ignored by git.
- This project is optimized for hackathon demo reliability over production hardening.
