import type { Device } from "../types.js";

function isOn(status: Device["status"]): boolean {
  return status === true || status === "on";
}

export function formatRoom(roomName: string, devices: Device[]): string {
  const displayName = formatRoomName(roomName);
  const fans = devices.filter((d) => d.type === "fan");
  const lights = devices.filter((d) => d.type === "light");

  const lines: string[] = [`## 📍 ${displayName}`];

  if (fans.length > 0) {
    lines.push("**💨 Fans**");
    for (const f of fans) {
      const icon = isOn(f.status) ? "🟢" : "🔴";
      lines.push(
        `${icon} \`${f.name.padEnd(7)}\` ${isOn(f.status) ? "ON" : "OFF"}  ${f.powerDraw}W`,
      );
    }
  }

  if (lights.length > 0) {
    lines.push("**💡 Lights**");
    for (const l of lights) {
      const icon = isOn(l.status) ? "🟢" : "🔴";
      lines.push(
        `${icon} \`${l.name.padEnd(7)}\` ${isOn(l.status) ? "ON" : "OFF"}  ${l.powerDraw}W`,
      );
    }
  }

  const totalPower = devices
    .filter((d) => isOn(d.status))
    .reduce((sum, d) => sum + d.powerDraw, 0);
  const activeCount = devices.filter((d) => isOn(d.status)).length;
  lines.push(
    `**Total:** ${totalPower}W (${activeCount}/${devices.length} devices ON)`,
  );

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
