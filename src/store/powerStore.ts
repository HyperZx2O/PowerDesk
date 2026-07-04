import { create } from 'zustand';
import type { PowerSummary, PowerReading } from '../types/power';

interface PowerStore {
  powerSummary: PowerSummary | null;
  powerHistory: PowerReading[];
  setPowerSummary: (summary: PowerSummary) => void;
  updateFromWsPayload: (data: Record<string, unknown>) => void;
  addPowerReading: (reading: PowerReading) => void;
}

const MAX_HISTORY = 20;

export const usePowerStore = create<PowerStore>((set, get) => ({
  powerSummary: null,
  powerHistory: [],
  setPowerSummary: (summary) => {
    const newReading: PowerReading = {
      time: new Date().toISOString(),
      watts: summary.totalWatts,
    };
    set({
      powerSummary: summary,
      powerHistory: [...get().powerHistory, newReading].slice(-MAX_HISTORY),
    });
  },
  updateFromWsPayload: (data) => {
    const totalWatts = (data.totalPower ?? data.totalWatts ?? 0) as number;
    const estimatedKwhToday = (data.estimatedKwhToday ?? 0) as number;

    const byRoomRaw = (data.byRoom ?? data.perRoom ?? {}) as Record<string, unknown>;
    const perRoom: Record<string, number> = {};
    for (const [room, val] of Object.entries(byRoomRaw)) {
      perRoom[room] =
        typeof val === 'object' && val !== null
          ? Number((val as Record<string, unknown>).power ?? 0)
          : Number(val ?? 0);
    }

    const summary: PowerSummary = { totalWatts, estimatedKwhToday, perRoom };
    const newReading: PowerReading = {
      time: new Date().toISOString(),
      watts: totalWatts,
    };
    set({
      powerSummary: summary,
      powerHistory: [...get().powerHistory, newReading].slice(-MAX_HISTORY),
    });
  },
  addPowerReading: (reading) =>
    set((state) => ({
      powerHistory: [...state.powerHistory, reading].slice(-MAX_HISTORY),
    })),
}));
