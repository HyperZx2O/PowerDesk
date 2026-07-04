import type { Device } from "../types.js";

function isOn(status: Device["status"]): boolean {
  return status === true || status === "on";
}

export function formatStatus(devices: Device[]): string {
  const rooms = new Map<string, Device[]>();
  for (const device of devices) {
    const list = rooms.get(device.room) ?? [];
    list.push(device);
    rooms.set(device.room, list);
  }

  const lines: string[] = ["## 🏢 Office Status"];

  for (const [room, roomDevices] of rooms) {
    const allOn = roomDevices.every((d) => isOn(d.status));
    const allOff = roomDevices.every((d) => !isOn(d.status));
    const roomName = formatRoomName(room);

    const totalPower = roomDevices
      .filter((d) => isOn(d.status))
      .reduce((sum, d) => sum + d.powerDraw, 0);

    if (allOff) {
      lines.push(`**${roomName}** — 🔴 All OFF`);
    } else if (allOn) {
      lines.push(`**${roomName}** — 🟢 All ON (${totalPower}W)`);
    } else {
      const deviceList = roomDevices
        .map((d) => {
          const icon = isOn(d.status) ? "🟢" : "🔴";
          return `${icon} ${d.name}`;
        })
        .join(" ");
      lines.push(`**${roomName}** — ${totalPower}W`);
      lines.push(`> ${deviceList}`);
    }
  }

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
