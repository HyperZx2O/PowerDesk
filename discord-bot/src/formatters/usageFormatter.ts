import type { PowerSummary } from "../types.js";

function progressBar(current: number, max: number, width = 10): string {
  if (max === 0) return "░".repeat(width);
  const filled = Math.round((current / max) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

export function formatUsage(summary: PowerSummary): string {
  const maxRoomPower = Math.max(...Object.values(summary.perRoom), 1);

  const lines: string[] = [
    "## ⚡ Power Usage",
    `**${summary.totalWatts}W** total across the office`,
  ];

  for (const [room, watts] of Object.entries(summary.perRoom)) {
    const bar = progressBar(watts, maxRoomPower);
    const pct = Math.round((watts / summary.totalWatts) * 100);
    lines.push(`${bar} **${formatRoomName(room)}** ${watts}W (${pct}%)`);
  }

  lines.push(`📊 Estimated today: **${summary.estimatedKwhToday} kWh**`);

  return lines.join("\n");
}

function formatRoomName(roomId: string): string {
  const names: Record<string, string> = {
    "drawing-room": "Drawing Room",
    "work-room-1": "Work Room 1",
    "work-room-2": "Work Room 2",
  };
  return names[roomId] ?? roomId;
}
