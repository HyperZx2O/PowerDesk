import { z } from 'zod';

export const AlertSchema = z.object({
  id: z.string(),
  type: z.enum(['after-hours', 'continuous-runtime', 'demo']),
  severity: z.string().optional(),
  room: z.string(),
  message: z.string(),
  devices: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  triggeredAt: z.string(),
  resolvedAt: z.string().nullable().optional(),
});

export type Alert = z.infer<typeof AlertSchema>;
