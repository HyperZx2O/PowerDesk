import { apiClient } from './client';
import type { Device } from '../types/device';
import { DevicesArraySchema } from '../types/device';

export async function getDevices(): Promise<Device[]> {
  const response = await apiClient.get('/api/devices');
  const raw = response.data;
  const devices: Device[] = [];
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const roomDevices of Object.values(raw)) {
      if (Array.isArray(roomDevices)) devices.push(...roomDevices);
    }
  } else if (Array.isArray(raw)) {
    devices.push(...raw);
  }
  return DevicesArraySchema.parse(devices);
}

export async function getDevicesByRoom(room: string): Promise<Device[]> {
  const response = await apiClient.get(`/api/devices/${encodeURIComponent(room)}`);
  const raw = response.data;
  const devices: Device[] = [];
  if (raw && typeof raw === 'object' && 'devices' in raw && Array.isArray(raw.devices)) {
    devices.push(...raw.devices);
  } else if (Array.isArray(raw)) {
    devices.push(...raw);
  }
  return DevicesArraySchema.parse(devices);
}
