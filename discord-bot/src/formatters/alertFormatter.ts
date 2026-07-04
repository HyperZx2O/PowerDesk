import type { AlertPayload } from "../types.js";

export function formatAlert(alert: AlertPayload): string {
  const time = formatAlertTime(alert.triggeredAt);
  const lines = [
    `> ⚠️ **Alert** — ${time}`,
    `> ${alert.message}`,
    `> 📍 ${formatRoomName(alert.room)}`,
  ];
  return lines.join("\n");
}

function formatAlertTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const ts = Math.floor(date.getTime() / 1000);
    return `<t:${ts}:R>`;
  } catch {
    return isoString;
  }
}

function formatRoomName(roomId: string): string {
  const names: Record<string, string> = {
    "drawing-room": "Drawing Room",
    "work-room-1": "Work Room 1",
    "work-room-2": "Work Room 2",
  };
  return names[roomId] ?? roomId;
}
