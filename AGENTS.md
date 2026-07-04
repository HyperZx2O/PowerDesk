# AGENTS.md

## What this is

Hackathon project: real-time office device simulator with three components in one repo.
- **Backend** — Node.js/Express REST API + WebSocket (`src/`, CommonJS)
- **Dashboard** — React/Vite/TypeScript SPA (`src/`, ESM)
- **Discord Bot** — discord.js v14 + TypeScript (`discord-bot/`, ESM)

Built for the 26 Techathon Nationals at IUT Robotics Society.

## Running the components

### Backend (Express + WS)

```bash
npm install
cp .env.example .env
npm start          # http://localhost:5000, ws://localhost:8080
npm run dev        # nodemon auto-restart
```

### Dashboard (React/Vite)

```bash
npm install
npx vite           # no "dev" script in root package.json
```

Vite serves the SPA. The dashboard connects to `http://localhost:3000` by default (see `src/env.ts`). You need to either:
- Set `VITE_BACKEND_URL=http://localhost:5000` in a `.env` file, or
- Run the mock server: `node server/index.js` (port 3000)

### Discord Bot

```bash
cd discord-bot
npm install
cp .env.example .env   # fill in DISCORD_TOKEN, CLIENT_ID, GUILD_ID
npm start              # tsx src/index.ts
npm run dev            # tsx watch
npm run register       # register slash commands
```

## Testing

### Backend — Node built-in test runner (not Jest)

```bash
npm test               # all tests in test/
```

10 test files, 50+ tests. Each integration test spins up its own Express server on a unique port (5001-5005). No external services required.

### Discord Bot — Jest

```bash
cd discord-bot
npm test               # Jest + ts-jest
```

6 test files covering config, formatters, errors, aliases, logging, LLM humanization.

### Dashboard — no test suite

There is no configured test runner for the React dashboard.

## Linting

### Dashboard

```bash
npx eslint .           # ESLint flat config, TypeScript + React hooks
```

Only lints `**/*.{ts,tsx}`. No prettier configured.

### Discord Bot

```bash
cd discord-bot
npx biome check .      # Biome: lint + format
```

2-space indent, double quotes, semicolons always.

## Architecture gotchas

### Mixed module systems

- Root `package.json` has `"type": "commonjs"` — backend `.js` files use `require()`/`module.exports`.
- `discord-bot/package.json` has `"type": "module"` — uses ESM imports.
- Dashboard TypeScript files use ESM imports (bundled by Vite).
- **Don't add `import` statements to backend `.js` files or `require()` to dashboard `.ts` files.**

### Port mismatch between components

The backend runs on port **5000** (REST) and **8080** (WebSocket). The dashboard and bot both default to these ports. The mock server (`server/index.js`) runs on port **3000** as a simpler alternative.

### Express 5.x

The backend uses Express **5.2.1**, not 4.x. Key differences: `req.query` returns `URLSearchParams`, error handling middleware signature changed. Don't apply Express 4 patterns.

### Device status type handling

The backend sends `status: true/false` (boolean). The dashboard and bot Zod schemas accept both boolean and string (`'on' | 'off'`) via `z.union()`. The `isDeviceOn()` helper in `src/types/device.ts` normalizes both formats.

### Two servers in the repo

- `src/index.js` — The real backend (Express + WS, port 5000/8080).
- `server/index.js` — A simpler mock server (port 3000, fewer endpoints, used by the dashboard default config).

They are independent. Don't confuse routes between them.

## Key data model

15 devices across 3 rooms (5 each: 2 fans + 3 lights). Rooms: `drawing-room`, `work-room-1`, `work-room-2`.

The simulator (`src/simulator.js`) is an EventEmitter that flips 1-2 devices every 30-60s. On each flip it emits `deviceChanged`, which triggers alert checks.

Device power: fans = 60W, lights = 15W. All responses use `{success, data, timestamp, error}` envelope.

## API contract

See `INTEGRATION.md` for the frozen hackathon contract. 6 REST endpoints, 3 WebSocket event types. No POST/PATCH/DELETE endpoints exist.

## What NOT to do

- Don't create `AGENTS.md` or `CLAUDE.md` again — this file is the instruction source.
- Don't assume specific power values or alert counts — everything is randomized by the simulator.
- Don't cache device state for more than a few seconds — the simulator flips devices every 30-60s.
- Don't add dependencies without checking which component they belong to — root `package.json` is backend-only, `discord-bot/package.json` is bot-only. Dashboard deps are implicit through Vite.
