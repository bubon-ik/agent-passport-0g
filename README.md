# Agent Passport

Agent Passport is a one-page MVP for 0G vibe coding: describe an AI agent, generate a public identity card, then store the artifact on 0G.

## Stack

- Vite + React + TypeScript
- Express + TypeScript
- 0G Compute via OpenAI-compatible endpoint
- 0G Storage via `@0glabs/0g-ts-sdk`

## Scripts

- `npm run dev` starts Vite and Express together
- `npm run dev:client` starts the frontend
- `npm run dev:server` starts the backend
- `npm run build` builds client and server
- `npm run typecheck` runs TypeScript checks

## Environment

Copy `.env.example` to `.env`.

`ALLOW_MOCK_MODE=true` keeps the demo usable even before 0G credentials are wired in.
