import { type Device, deviceSchema } from "../types.js";
import { apiClient } from "./client.js";
import { BotError } from "./errors.js";

export async function getAllDevices(): Promise<Device[]> {
  const response = await apiClient.get("/api/devices");
  const raw = response.data;
  const devices: Device[] = [];
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const roomDevices of Object.values(raw)) {
      if (Array.isArray(roomDevices)) {
        devices.push(...roomDevices);
      }
    }
  } else if (Array.isArray(raw)) {
    devices.push(...raw);
  }
  const result = deviceSchema.array().safeParse(devices);
  if (!result.success) {
    throw new BotError(
      "Received malformed device data from backend",
      "VALIDATION_ERROR",
    );
  }
  return result.data;
}

export async function getDevicesByRoom(room: string): Promise<Device[]> {
  const response = await apiClient.get(
    `/api/devices/${encodeURIComponent(room)}`,
  );
  const raw = response.data;
  const devices: Device[] = [];
  if (
    raw &&
    typeof raw === "object" &&
    "devices" in raw &&
    Array.isArray(raw.devices)
  ) {
    devices.push(...raw.devices);
  } else if (Array.isArray(raw)) {
    devices.push(...raw);
  }
  const result = deviceSchema.array().safeParse(devices);
  if (!result.success) {
    throw new BotError(
      "Received malformed device data from backend",
      "VALIDATION_ERROR",
    );
  }
  return result.data;
}
