import { z } from "zod";

export const deviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["fan", "light"]),
  room: z.string(),
  status: z.union([z.boolean(), z.enum(["on", "off"])]),
  powerDraw: z.number(),
  lastChanged: z.string(),
});

export const powerSummarySchema = z.object({
  totalWatts: z.number(),
  estimatedKwhToday: z.number(),
  perRoom: z.record(z.number()),
});

export const alertPayloadSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  severity: z.string().optional(),
  room: z.string(),
  message: z.string(),
  devices: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  triggeredAt: z.string(),
  resolvedAt: z.string().nullable().optional(),
});

export type Device = z.infer<typeof deviceSchema>;
export type PowerSummary = z.infer<typeof powerSummarySchema>;
export type AlertPayload = z.infer<typeof alertPayloadSchema>;

export type HumanizeType = "status" | "room" | "usage" | "alert";
