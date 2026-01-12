import { config } from 'dotenv';
import { z } from 'zod';

config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  CLIENT_ORIGIN: z.string().min(1, 'CLIENT_ORIGIN is required'),
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_CLIENT_EMAIL: z.string().email('Invalid FIREBASE_CLIENT_EMAIL'),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required'),
});

type EnvConfig = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const rawConfig: EnvConfig = parsed.data;

export const env = {
  ...rawConfig,
  PORT: Number(rawConfig.PORT),
  FIREBASE_PRIVATE_KEY: rawConfig.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};
