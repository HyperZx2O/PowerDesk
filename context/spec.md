# SPEC.md — Lights, Fans, Discord: The Boss's Big Idea
**Techhathon Nationals × IUT Robotics Society**  
**Version:** 1.0 (Canonical)  
**Status:** Single Source of Truth  
**Last reviewed:** July 2026

> **⚠️ Device Count Fix (read first)**  
> The problem statement contains an error: it says "18 devices." The correct count is **15 devices total** — 3 rooms × 5 devices per room (2 fans + 3 lights). Every test, assertion, log message, and hardcoded count in the codebase must use **15**, not 18.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Office Setup (Fixed)](#2-office-setup-fixed)
3. [Device Data Model](#3-device-data-model)
4. [Architecture](#4-architecture)
5. [Backend Specification](#5-backend-specification)
6. [Dashboard Specification](#6-dashboard-specification)
7. [Discord Bot Specification](#7-discord-bot-specification)
8. [Shared Integration Contract](#8-shared-integration-contract)
9. [Alert Rules](#9-alert-rules)
10. [Power Calculation Rules](#10-power-calculation-rules)
11. [Deliverables Checklist](#11-deliverables-checklist)
12. [Evaluation Criteria](#12-evaluation-criteria)
13. [Git Strategy](#13-git-strategy)

---

## 1. System Overview

The boss wants to monitor every light and fan in a small office via a live web dashboard and a Discord bot, both backed by a single simulated data source. No real hardware exists — all device state is simulated.

**Information flow (authoritative):**

```
[Device Simulator]
      │
      ▼
[Backend API — single source of truth]
      │                    │
      ▼                    ▼
[React Dashboard]    [Discord Bot]
      │                    │
      ▼                    ▼
[Boss's browser]    [Boss's Discord]
```

**Core constraints:**
- One backend serves both clients. No separate state stores.
- Dashboard updates must be live (no manual page refresh).
- Bot responses must reflect the same state visible on the dashboard at the same instant.
- All device data is simulated; no real hardware is needed.
- LLM-generated conversational responses for the bot are strongly encouraged.

---

## 2. Office Setup (Fixed)

These values are fixed for everyone. Do not change them.

| Room | Room ID | Fans | Lights | Devices |
|---|---|---|---|---|
| Drawing Room | `drawing-room` | 2 | 3 | 5 |
| Work Room 1 | `work-room-1` | 2 | 3 | 5 |
| Work Room 2 | `work-room-2` | 2 | 3 | 5 |
| **Total** | — | **6** | **9** | **15** |

**Device naming convention:**

| Device | ID pattern | Name label |
|---|---|---|
| Fan 1 in Drawing Room | `drawing-room-fan-1` | `Fan 1` |
| Fan 2 in Drawing Room | `drawing-room-fan-2` | `Fan 2` |
| Light 1 in Drawing Room | `drawing-room-light-1` | `Light 1` |
| Light 2 in Drawing Room | `drawing-room-light-2` | `Light 2` |
| Light 3 in Drawing Room | `drawing-room-light-3` | `Light 3` |
| *(same pattern for `work-room-1` and `work-room-2`)* | | |

All 15 device IDs follow the pattern: `{room-id}-{type}-{index}`.

---

## 3. Device Data Model

This is the canonical shape of a single device. Every component (backend, dashboard, bot) must agree on this shape.

```ts
interface Device {
  id: string;           // e.g. "drawing-room-fan-1"
  name: string;         // e.g. "Fan 1"
  type: "fan" | "light";
  room: string;         // kebab-case room ID: "drawing-room" | "work-room-1" | "work-room-2"
  status: boolean;      // true = ON, false = OFF
  powerDraw: number;    // Watts. Fan: 60W (on) / 0W (off). Light: 15W (on) / 0W (off).
  lastChanged: string;  // ISO 8601 UTC timestamp: "2025-01-15T14:30:00Z"
}
```

**Power draw values (fixed):**

| Device type | Status ON | Status OFF |
|---|---|---|
| Fan | 60 W | 0 W |
| Light | 15 W | 0 W |

**Maximum possible total office load:** (6 fans × 60W) + (9 lights × 15W) = 360W + 135W = **495W**

---

## 4. Architecture

### 4.1 Repository Structure

```
lights-fans-discord/
├── backend/             # Express.js API + WebSocket + simulator
├── dashboard/           # React + Vite frontend
├── discord-bot/         # Discord.js bot (TypeScript)
├── diagrams/            # System diagram + circuit schematic (required deliverables)
└── README.md            # Root setup instructions
```

### 4.2 Ports (Development)

| Service | Protocol | Port |
|---|---|---|
| Backend REST API | HTTP | `5000` |
| Backend WebSocket | WS | `5000` (same server, `/ws` path) or `8080` (separate) |
| React Dashboard | HTTP | `5173` (Vite default) |

> Prefer serving WebSocket on the same port as HTTP (e.g. via `ws` library upgrade on the same Express server) to avoid CORS complications.

### 4.3 Layered Architecture

```
┌─────────────────────────────────────────┐
│   Clients: Dashboard, Discord Bot       │
└──────────────┬──────────────────────────┘
               │  HTTP + WebSocket
┌──────────────▼──────────────────────────┐
│   Express Router (REST endpoints)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Business Logic                        │
│   alertEngine.js · powerCalculator.js  │
│   timings.js (office hours)             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Data Layer                            │
│   simulator.js (in-memory state, 15 devices) │
└─────────────────────────────────────────┘
```

---

## 5. Backend Specification

**Owner:** Person 0  
**Branch:** `backend/main`  
**Language:** Node.js (JavaScript, ES Modules)  
**Framework:** Express.js

### 5.1 Technology Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 18+ |
| HTTP Framework | Express.js |
| Real-time | Native `ws` library (WebSocket upgrade on same port as Express) |
| Validation | Zod or manual validation |
| Logging | `pino` (structured) or `console` |
| Config | `dotenv` |

### 5.2 Folder Structure

```
backend/
├── src/
│   ├── index.js              # Entry — Express + WS setup, starts simulator
│   ├── config.js             # Env var loading, constants
│   ├── simulator.js          # Device state store + simulation engine
│   ├── powerCalculator.js    # Power aggregation functions
│   ├── alertEngine.js        # Alert detection + broadcast
│   ├── routes/
│   │   ├── devices.js        # GET /api/devices, GET /api/devices/:room
│   │   ├── power.js          # GET /api/power/summary
│   │   └── alerts.js         # GET /api/alerts
│   ├── models/
│   │   └── device.js         # Device schema + factory function
│   ├── utils/
│   │   ├── logger.js
│   │   ├── timings.js        # isOfficeHours(), continuous runtime helpers
│   │   └── constants.js      # FAN_WATTAGE, LIGHT_WATTAGE, ROOMS, OFFICE_HOURS
│   └── middleware/
│       └── errorHandler.js
├── .env.example
├── package.json
└── README.md
```

### 5.3 Device Simulator (`simulator.js`)

**Initialization:** Creates all 15 devices in memory on startup. Each device gets a random initial `status` and `lastChanged` within the past 2 hours.

**Simulation loop:** Every 30–60 seconds (random interval), each device independently has a ~20% chance of toggling its status. On toggle:
- Update `status`
- Update `lastChanged` to `new Date().toISOString()`
- Broadcast `device_update` WebSocket event
- Re-evaluate alert conditions

**Exported API (used by routes):**
```js
simulator.getAllDevices()          // → { "drawing-room": Device[], "work-room-1": Device[], "work-room-2": Device[] }
simulator.getDevicesByRoom(roomId) // → Device[] | null
simulator.getDevice(id)            // → Device | null
```

### 5.4 REST Endpoints

All responses use this envelope:
```json
{
  "success": true,
  "data": { },
  "timestamp": "2025-01-15T14:30:00Z",
  "error": null
}
```

---

#### `GET /api/devices`

Returns all 15 devices grouped by room.

**Response `data` shape:**
```json
{
  "drawing-room": [
    { "id": "drawing-room-fan-1", "name": "Fan 1", "type": "fan", "room": "drawing-room", "status": true, "powerDraw": 60, "lastChanged": "2025-01-15T14:25:30Z" },
    { "id": "drawing-room-fan-2", "name": "Fan 2", "type": "fan", "room": "drawing-room", "status": false, "powerDraw": 0, "lastChanged": "2025-01-15T13:10:00Z" },
    { "id": "drawing-room-light-1", "name": "Light 1", "type": "light", "room": "drawing-room", "status": true, "powerDraw": 15, "lastChanged": "2025-01-15T14:00:00Z" },
    { "id": "drawing-room-light-2", "name": "Light 2", "type": "light", "room": "drawing-room", "status": true, "powerDraw": 15, "lastChanged": "2025-01-15T12:30:00Z" },
    { "id": "drawing-room-light-3", "name": "Light 3", "type": "light", "room": "drawing-room", "status": false, "powerDraw": 0, "lastChanged": "2025-01-15T11:00:00Z" }
  ],
  "work-room-1": [ /* 5 devices */ ],
  "work-room-2": [ /* 5 devices */ ]
}
```

**Errors:** 500 if simulator is unavailable.

---

#### `GET /api/devices/:room`

Returns the 5 devices for a specific room.

**Path param:** `room` — must be one of `drawing-room`, `work-room-1`, `work-room-2`.

**Response `data` shape:**
```json
{
  "room": "work-room-1",
  "devices": [ /* 5 Device objects */ ]
}
```

**Error (400):**
```json
{ "success": false, "data": null, "timestamp": "...", "error": { "code": "INVALID_ROOM", "message": "Room 'xyz' not found. Valid: drawing-room, work-room-1, work-room-2" } }
```

---

#### `GET /api/power/summary`

Returns current power draw — total and per-room — plus today's estimated kWh.

**Response `data` shape:**
```json
{
  "totalWatts": 225,
  "estimatedKwhToday": 1.8,
  "perRoom": {
    "drawing-room": 75,
    "work-room-1": 0,
    "work-room-2": 150
  }
}
```

**How `estimatedKwhToday` is calculated:** `totalWatts × hoursElapsedToday / 1000`. Hours elapsed = current hour + (current minute / 60).

---

#### `GET /api/alerts`

Returns the current list of active alerts (not historical — only conditions that are true right now, plus any triggered in the past 60 minutes).

**Query params:**
- `?limit=N` — cap results (default 20)

**Response `data` shape:**
```json
{
  "alerts": [
    {
      "id": "alert-uuid",
      "type": "after-hours",
      "room": "work-room-2",
      "message": "Devices left on after office hours (5 PM)",
      "triggeredAt": "2025-01-15T17:05:00Z"
    }
  ]
}
```

---

#### `GET /api/status`

Health check endpoint. Returns `200 OK` if backend is up.

```json
{ "success": true, "data": { "status": "ok", "deviceCount": 15, "uptime": 3600 }, "timestamp": "..." }
```

---

### 5.5 WebSocket Events

WebSocket endpoint: `ws://localhost:5000` (or `ws://localhost:8080`).

The server **broadcasts** the following events to all connected clients whenever state changes:

**Event: `device_update`**
```json
{
  "event": "device_update",
  "data": {
    "id": "work-room-2-fan-1",
    "status": false,
    "powerDraw": 0,
    "lastChanged": "2025-01-15T14:31:00Z"
  }
}
```

**Event: `alert`**
```json
{
  "event": "alert",
  "data": {
    "id": "alert-uuid",
    "type": "after-hours",
    "room": "work-room-2",
    "message": "Devices left on after office hours (5 PM)",
    "triggeredAt": "2025-01-15T17:05:00Z"
  }
}
```

**Event: `power_update`**
```json
{
  "event": "power_update",
  "data": {
    "totalWatts": 225,
    "estimatedKwhToday": 1.8,
    "perRoom": {
      "drawing-room": 75,
      "work-room-1": 0,
      "work-room-2": 150
    }
  }
}
```

> All messages are JSON strings. Clients parse with `JSON.parse(event.data)` and dispatch on `event.event`.

### 5.6 Environment Variables

```env
# .env.example
PORT=5000
WS_PORT=5000           # If using same port as HTTP, set equal to PORT
OFFICE_START_HOUR=9    # 24h format
OFFICE_END_HOUR=17     # 24h format
SIMULATE_INTERVAL_MIN=30000   # ms
SIMULATE_INTERVAL_MAX=60000   # ms
```

### 5.7 Acceptance Criteria

- [ ] `GET /api/devices` returns all **15 devices** in the nested room structure.
- [ ] `GET /api/devices/:room` returns exactly **5 devices** for a valid room.
- [ ] Invalid room ID returns 400 with `INVALID_ROOM` error code.
- [ ] `GET /api/power/summary` returns correct watt totals (sum of `powerDraw` of all ON devices).
- [ ] `GET /api/alerts` returns valid alert array (may be empty).
- [ ] `GET /api/status` returns 200 with `deviceCount: 15`.
- [ ] Simulator toggles device states every 30–60 seconds.
- [ ] WebSocket broadcasts `device_update` on every state change.
- [ ] WebSocket broadcasts `alert` when an alert condition is triggered.
- [ ] CORS is enabled for `http://localhost:5173`.
- [ ] No unhandled promise rejections.

---

## 6. Dashboard Specification

**Owner:** Person 2  
**Branch:** `feature/dashboard`  
**Language:** TypeScript  
**Framework:** React + Vite

### 6.1 Technology Stack

| Library | Purpose |
|---|---|
| `react` + `vite` | Core framework |
| `zustand` | Global state (devices, alerts) |
| `@tanstack/react-query` | Initial HTTP load + fallback polling |
| `recharts` | Power consumption chart |
| `framer-motion` | Fan spin animation, light glow, panel transitions |
| `lucide-react` | Icon set |
| `tailwindcss` | Utility styling |
| `axios` | HTTP client |
| `zod` | Runtime API response validation |
| `dayjs` | Timestamp formatting |
| `typescript` | Static typing |
| `biome` | Linter + formatter |

### 6.2 Folder Structure

```
dashboard/
├── public/
│   └── office-floorplan.svg       # SVG floor plan
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types.ts                   # Device, Alert, PowerSummary interfaces
│   ├── api/
│   │   ├── client.ts              # Axios instance (baseURL from env)
│   │   ├── devices.ts             # getDevices(), getDevicesByRoom()
│   │   └── power.ts               # getPowerSummary()
│   ├── ws/
│   │   └── useOfficeSocket.ts     # WS hook — connects, parses events, pushes to store
│   ├── store/
│   │   ├── deviceStore.ts         # Zustand — devices[], setDevices(), updateDevice()
│   │   └── alertStore.ts          # Zustand — alerts[], addAlert(), dismissAlert()
│   ├── hooks/
│   │   ├── useDevices.ts          # Merges React Query + WS live updates
│   │   ├── usePowerSummary.ts     # Polls /api/power/summary every 5s
│   │   └── useAlerts.ts           # Reads alert store, newest first
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── TopBar.tsx         # Office name + connection status dot
│   │   ├── room/
│   │   │   ├── RoomGrid.tsx       # Maps 3 rooms → RoomCard
│   │   │   └── RoomCard.tsx       # Room name, device list, room power total
│   │   ├── device/
│   │   │   ├── DeviceCard.tsx     # Fan or Light — name, status badge, wattage
│   │   │   ├── FanIcon.tsx        # Animated SVG fan (spins when ON)
│   │   │   └── LightIcon.tsx      # Glowing bulb SVG (glows when ON)
│   │   ├── power/
│   │   │   ├── PowerMeter.tsx     # Total watts display
│   │   │   ├── RoomPowerBar.tsx   # Per-room horizontal bar
│   │   │   └── PowerChart.tsx     # Recharts line chart
│   │   ├── alerts/
│   │   │   ├── AlertPanel.tsx     # Scrollable alert list
│   │   │   └── AlertItem.tsx      # Icon + message + timestamp
│   │   └── floorplan/
│   │       ├── FloorPlan.tsx      # SVG-based office map (BONUS)
│   │       ├── FanMarker.tsx      # Spinning fan on floor plan
│   │       └── LightMarker.tsx    # Glowing dot on floor plan
│   └── utils/
│       ├── deviceHelpers.ts       # groupByRoom(), countOn(), totalWatts()
│       └── formatters.ts          # formatWatts(), formatTime(), formatRoomName()
├── .env.example
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── biome.json
└── README.md
```

### 6.3 Required Features (Minimum — graded)

#### Live Device Status Panel
- Displays all **15 devices** organized by room (3 room cards, 5 devices each).
- Each device shows: name, type icon, ON/OFF status badge, wattage when ON.
- Updates in real time via WebSocket — no page refresh required.
- Each device card uses `React.memo` to avoid unnecessary re-renders.

#### Live Power Consumption Meter
- Shows current total watts across entire office.
- Shows per-room power breakdown (3 bars or values).
- Updates alongside device panel.

#### Active Alerts Panel
- Shows timestamped alerts for anomalous conditions (see §9).
- Auto-updates when new alerts arrive via WebSocket.
- Each alert shows: type icon, human-readable message, `triggeredAt` formatted as local time.
- Cap at 20 alerts in memory (drop oldest).

### 6.4 Bonus Features (graded under UX quality)

- **Animated floor plan** with top-view office layout: fans spin when ON, lights glow when ON.
- Fan rotation: `framer-motion` continuous `rotate` animation, paused when OFF.
- Light glow: CSS box-shadow / drop-shadow pulse when ON, dim when OFF.
- Room overlays pulse amber when that room has an active alert.

### 6.5 State Management

```ts
// deviceStore.ts
{
  devices: Device[];         // flat array of all 15 devices
  lastUpdated: string | null;
  setDevices: (arr: Device[]) => void;
  updateDevice: (id: string, patch: Partial<Device>) => void;
}

// alertStore.ts
{
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  dismissAlert: (id: string) => void;
}
```

**Data flow:**
1. Mount: React Query `GET /api/devices` → `setDevices()`
2. `useOfficeSocket` connects to `ws://backend/ws`
3. `device_update` event → `updateDevice(id, patch)` (no re-fetch)
4. `alert` event → `addAlert(alert)`
5. `power_update` event → local power state
6. Components read only from hooks, never stores directly.

### 6.6 Visual Design (Dark theme)

```
Background:     #0f1117
Surface:        #1a1d27
Border:         #2d3147
Primary accent: #6366f1  (indigo)
Fan ON:         #38bdf8  (sky blue)
Light ON:       #fbbf24  (amber)
Alert:          #f59e0b
Critical:       #ef4444
Text primary:   #f1f5f9
Text muted:     #64748b
Success:        #22c55e
```

Typography: `Inter` for UI, `JetBrains Mono` or `ui-monospace` for watt values.

### 6.7 Environment Variables

```env
# .env.example
VITE_BACKEND_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

### 6.8 Acceptance Criteria

- [ ] Dashboard loads and shows all **15 devices** without blank state.
- [ ] Device status matches `!status` from the bot at the same moment.
- [ ] Device state change on backend → dashboard updates within 2 seconds, no refresh.
- [ ] Total watts matches `/api/power/summary`.
- [ ] At least one alert renders correctly with timestamp.
- [ ] Fan icons visibly spin when ON.
- [ ] Light icons visibly glow when ON.
- [ ] Connection status dot in TopBar reflects WS state.
- [ ] No console errors during normal operation.
- [ ] Responsive at 1280px desktop and 768px tablet.

---

## 7. Discord Bot Specification

**Owner:** Person 1  
**Branch:** `feature/discord-bot`  
**Language:** TypeScript  
**Library:** `discord.js` v14

### 7.1 Technology Stack

| Package | Purpose |
|---|---|
| `discord.js` | Discord API client |
| `@discordjs/rest` | Slash command registration |
| `axios` | HTTP client for backend |
| `ws` | WebSocket for alert subscription |
| `dotenv` | Env vars |
| `zod` | Validate env + backend responses |
| `typescript` | Static typing |
| `tsx` | Dev-time TypeScript runner |
| `pino` or `winston` | Structured logging |
| `groq` or `openai` (optional) | LLM humanization of responses |

### 7.2 Folder Structure

```
discord-bot/
├── src/
│   ├── index.ts
│   ├── config.ts              # Zod-validated env vars
│   ├── types.ts               # Device, Alert, PowerSummary types
│   ├── commands/
│   │   ├── index.ts           # Command registry
│   │   ├── status.ts          # !status / /status
│   │   ├── room.ts            # !room <name> / /room
│   │   └── usage.ts           # !usage / /usage
│   ├── events/
│   │   ├── ready.ts
│   │   ├── interactionCreate.ts
│   │   └── messageCreate.ts
│   ├── api/
│   │   ├── client.ts          # Axios base
│   │   ├── devices.ts
│   │   └── power.ts
│   ├── ws/
│   │   └── alertListener.ts   # WS connection + alert forwarding
│   ├── formatters/
│   │   ├── statusFormatter.ts
│   │   ├── roomFormatter.ts
│   │   ├── usageFormatter.ts
│   │   └── alertFormatter.ts
│   └── llm/
│       └── humanize.ts        # Optional LLM wrapper
├── scripts/
│   └── registerCommands.ts
├── .env.example
├── package.json
├── tsconfig.json
├── biome.json
└── README.md
```

### 7.3 Required Commands

Support both prefix (`!`) and slash (`/`) syntax. Both paths call identical handlers.

---

#### `!status` / `/status`

**Backend call:** `GET /api/devices`

**Behavior:** Summarize the on/off state of all **15 devices** across all 3 rooms in a friendly, conversational message.

**Template fallback (if no LLM):**
```
🏢 Office Status
Drawing Room: Fan 1 ON, Fan 2 OFF, Light 1 ON, Light 2 ON, Light 3 OFF
Work Room 1: all devices OFF
Work Room 2: Fan 1 ON, Fan 2 ON, Light 1 ON, Light 2 ON, Light 3 ON
```

**LLM prompt (if enabled):**
> You are a friendly office assistant. Given this device state: [JSON]. Write a 2–3 sentence summary in a warm, casual tone. Mention rooms with notable situations (all on, all off, any after-hours). Keep under 100 words.

---

#### `!room <name>` / `/room name:<name>`

**Backend call:** `GET /api/devices/:room`

**Room name aliases:**

| User input | Room ID sent to backend |
|---|---|
| `drawing`, `drawing room`, `dr` | `drawing-room` |
| `work1`, `work room 1`, `wr1` | `work-room-1` |
| `work2`, `work room 2`, `wr2` | `work-room-2` |

**Template fallback:**
```
📍 Work Room 2
Fans: Fan 1 ON (60W), Fan 2 ON (60W)
Lights: Light 1 ON (15W), Light 2 ON (15W), Light 3 ON (15W)
Room total: 150W
```

**Invalid room:**
```
Hmm, I don't recognize that room. Try: drawing, work1, or work2.
```

---

#### `!usage` / `/usage`

**Backend call:** `GET /api/power/summary`

**Template fallback:**
```
⚡ Power Usage
Right now: 225W across the whole office
Today's estimated usage: 1.8 kWh
Breakdown: Drawing Room 75W · Work Room 1 0W · Work Room 2 150W
```

---

### 7.4 Proactive Alert Subscription (Bonus — graded)

The bot maintains a persistent WebSocket connection to `ws://BACKEND_HOST/ws`.

On `alert` event:
1. Parse `{ type, room, message, triggeredAt }`
2. Format with `alertFormatter.ts`
3. Post to `ALERT_CHANNEL_ID`

**Alert message example:**
```
⚠️ Alert — 10:03 PM
Work Room 2 still has 2 fans and 3 lights ON. Office hours ended at 5 PM. Did someone forget to leave?
```

WebSocket reconnects automatically on disconnect (exponential backoff, max 5 retries).

### 7.5 LLM Humanization (Optional but strongly encouraged)

Function signature:
```ts
export async function humanize(
  type: "status" | "room" | "usage" | "alert",
  data: unknown
): Promise<string>
```

- Use any LLM provider (Groq, OpenRouter, OpenAI).
- Max 150 output tokens per call.
- On LLM failure → silently fall back to template formatter.
- Never let LLM failure surface as a user-visible error.

### 7.6 Environment Variables

```env
# .env.example
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
ALERT_CHANNEL_ID=
COMMAND_PREFIX=!

BACKEND_BASE_URL=http://localhost:5000
BACKEND_WS_URL=ws://localhost:5000

LLM_API_KEY=          # Optional — leave blank to disable humanization
LLM_MODEL=            # e.g. llama-3.3-70b-versatile (Groq) or claude-sonnet-4-6
```

`config.ts` must validate all required vars with Zod at startup. Missing vars = process exit with readable error.

### 7.7 Error Handling

| Scenario | Bot response |
|---|---|
| Backend unreachable | "The office system is offline right now. Try again in a moment." |
| Backend 5xx | "Got an unexpected error from the office server." |
| Invalid room name | "I don't recognize that room. Try: drawing, work1, or work2." |
| LLM failure | Silent fallback to template |
| WS disconnect | Silent reconnect, no user message |
| Missing command argument | Usage hint in reply |

Slash command errors should be `ephemeral: true`.

### 7.8 Acceptance Criteria

- [ ] `!status` returns accurate on/off state for all **15 devices**, matching dashboard.
- [ ] `!room work2` returns only Work Room 2 devices (5 devices).
- [ ] `!usage` reports total watts and estimated kWh from backend — not hardcoded.
- [ ] Alert triggers → bot posts to `ALERT_CHANNEL_ID` within 5 seconds.
- [ ] Invalid room name → helpful error, no crash.
- [ ] Bot recovers from backend downtime.
- [ ] No tokens or credentials in source code.

---

## 8. Shared Integration Contract

This section is the authoritative contract. Backend implements this; dashboard and bot consume it. Any deviation from this contract is a bug.

### 8.1 REST API

| Method | Path | Consumer | Purpose |
|---|---|---|---|
| GET | `/api/devices` | Dashboard, Bot | All 15 devices grouped by room |
| GET | `/api/devices/:room` | Dashboard, Bot | 5 devices for a specific room |
| GET | `/api/power/summary` | Dashboard, Bot | Power totals |
| GET | `/api/alerts` | Dashboard | Current alerts |
| GET | `/api/status` | Bot (health) | Backend health check |

### 8.2 WebSocket Events

| Event name | Broadcast when | Consumer |
|---|---|---|
| `device_update` | Any device toggles | Dashboard, Bot (optional) |
| `alert` | Alert condition triggered | Dashboard, Bot |
| `power_update` | After any device toggle | Dashboard |

### 8.3 Canonical Type Definitions

```ts
// Types that every component must agree on:

interface Device {
  id: string;
  name: string;
  type: "fan" | "light";
  room: "drawing-room" | "work-room-1" | "work-room-2";
  status: boolean;       // true = ON
  powerDraw: number;     // Watts (0 if OFF)
  lastChanged: string;   // ISO 8601 UTC
}

interface PowerSummary {
  totalWatts: number;
  estimatedKwhToday: number;
  perRoom: Record<string, number>;  // room-id → watts
}

interface Alert {
  id: string;
  type: "after-hours" | "continuous-runtime" | "anomaly";
  room: string;          // room-id or "all"
  message: string;
  triggeredAt: string;   // ISO 8601 UTC
}

// WebSocket message wrapper
interface WsMessage {
  event: "device_update" | "alert" | "power_update";
  data: Device | Alert | PowerSummary;
}
```

---

## 9. Alert Rules

The backend alert engine runs on every simulator tick and whenever a device toggles.

### Alert Type 1: After-Hours Devices

**Condition:** Current time is outside office hours (before 09:00 or after 17:00) AND at least one device in a room is ON.

**Triggered per room** (one alert per room, not per device).

**Message template:** `"{Room} still has {N} device(s) ON. Office hours ended at 5 PM."`

**Re-trigger:** Only once per room per out-of-hours session. Do not flood alerts.

### Alert Type 2: Continuous Runtime

**Condition:** All 5 devices in a room have been continuously ON for more than 2 hours (their `lastChanged` timestamps all indicate the device went ON more than 2 hours ago and status is still ON).

**Triggered per room.**

**Message template:** `"All devices in {Room} have been running for over 2 hours continuously."`

### Alert Deduplication

Do not re-emit the same alert type for the same room within 15 minutes. Use a simple in-memory map: `{ roomId-alertType: lastTriggeredAt }`.

---

## 10. Power Calculation Rules

All power math is done in the backend. Consumers never recalculate power from raw device data.

```
device.powerDraw = device.status ? (device.type === "fan" ? 60 : 15) : 0

roomWatts(room) = sum(device.powerDraw for each device in room)

totalWatts = sum(roomWatts for all rooms)

estimatedKwhToday = totalWatts × hoursElapsedToday / 1000
  where hoursElapsedToday = currentHour + (currentMinute / 60)
```

**Maximum theoretical load:** 6 fans × 60W + 9 lights × 15W = **495W**

---

## 11. Deliverables Checklist

### Required (graded)

- [ ] **Public Git repository** with clean commit history
- [ ] **README.md** at root — explains how to run backend, dashboard, and bot from scratch
- [ ] **`diagrams/system-diagram.*`** — high-level flow: simulator → backend → dashboard + bot → user. Do NOT use Mermaid. Use any other tool or draw manually.
- [ ] **`diagrams/circuit-schematic.*`** — Wokwi or Tinkercad schematic for one room (5 devices: 2 fans, 3 lights) wired to an ESP32/Arduino. Must make physical sense.
- [ ] **Working backend** — all endpoints respond, simulator running, WS broadcasting
- [ ] **Working dashboard** — all 15 devices visible, real-time updates, power meter, alert panel
- [ ] **Working Discord bot** — all 3 commands functional with live backend data
- [ ] **`.env.example`** for each component
- [ ] **README sections** for each component (setup + how to run)

### Bonus (extra points)

- [ ] Animated floor plan (fans spin, lights glow)
- [ ] Bot proactively posts alerts to Discord channel via WebSocket
- [ ] LLM-humanized bot responses (Groq, OpenRouter, etc.)

### Video Demo

- Max 3 minutes
- Show: dashboard live, bot commands in action, explain data flow
- Keep it concise and clear

---

## 12. Evaluation Criteria

| Criterion | Weight |
|---|---|
| Working web dashboard with real-time data | 20% |
| Working Discord bot reflecting real simulated data | 10% |
| Dashboard visuals and UX quality | 10% |
| Clear, correct system diagram | 15% |
| Sensible circuit schematic | 15% |
| Quality of demo & dummy data simulation | 15% |
| Well-structured and documented codebase + commits | 15% |

**Total: 100%**

---

## 13. Git Strategy

### Branch Structure

```
main
├── backend/main          → backend code
├── feature/dashboard     → React dashboard
└── feature/discord-bot   → Discord bot
```

Merge to `main` via PRs with at least one teammate review.

### Commit Convention

```
feat(backend): add alert engine for after-hours detection
feat(dashboard): implement fan spin animation
feat(bot): add !room command with alias mapping
fix(backend): correct device count to 15 in simulator init
fix(dashboard): prevent re-render of DeviceCard when unrelated device changes
docs(root): update README with setup instructions
test(backend): add unit tests for power calculator
```

### PR Checklist (before merge to main)

- [ ] All component acceptance criteria pass
- [ ] `.env.example` is accurate and complete
- [ ] No hardcoded URLs, tokens, or credentials in source
- [ ] Biome passes with no errors (frontend / bot)
- [ ] README section for this component is written and accurate
- [ ] Device count is **15** everywhere (no stale "18" references)

---

## Appendix A: Quick Reference — Device IDs

All 15 canonical device IDs:

```
drawing-room-fan-1        work-room-1-fan-1        work-room-2-fan-1
drawing-room-fan-2        work-room-1-fan-2        work-room-2-fan-2
drawing-room-light-1      work-room-1-light-1      work-room-2-light-1
drawing-room-light-2      work-room-1-light-2      work-room-2-light-2
drawing-room-light-3      work-room-1-light-3      work-room-2-light-3
```

## Appendix B: Common Mistakes to Avoid

| Mistake | Correct behaviour |
|---|---|
| Using `18` as device count | Always use **15** |
| Bot fabricating or hardcoding data | All data must come from a live backend HTTP call |
| Dashboard calculating power from raw devices | Power comes from `/api/power/summary` |
| Re-fetching all devices on every WS message | Use `updateDevice(id, patch)` for single-device updates |
| Polling more than once per 5 seconds on power | Once per 5 seconds is fine; less is better |
| Emitting the same alert repeatedly every tick | Deduplicate within 15-minute windows |
| Mermaid diagrams | Use any other tool. Mermaid is explicitly banned by the problem statement. |

## Appendix C: Sample Power Scenarios

| State | Drawing Room | Work Room 1 | Work Room 2 | Total |
|---|---|---|---|---|
| All OFF | 0W | 0W | 0W | 0W |
| All fans ON, all lights OFF | 120W | 120W | 120W | 360W |
| All ON | 165W | 165W | 165W | 495W |
| Typical mixed | 75W | 0W | 150W | 225W |
