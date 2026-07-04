import { z } from 'zod';

const EnvSchema = z.object({
  VITE_BACKEND_URL: z.string().url(),
  VITE_WS_URL: z.string().url(),
});

export const env = EnvSchema.parse({
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000',
  VITE_WS_URL: import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080',
});
