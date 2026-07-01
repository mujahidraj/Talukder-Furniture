import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// In production, critical secrets MUST be set via environment variables.
// In development, fallback values are used for convenience.
function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`FATAL: Environment variable ${key} is required but not set.`);
  }
  if (isProduction && fallback && value === fallback) {
    throw new Error(`FATAL: Environment variable ${key} is using the insecure default value. Set a strong value in production.`);
  }
  return value;
}

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  jwt: {
    secret: requireEnv('JWT_SECRET', isProduction ? undefined : 'dev-secret-change-in-production'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: requireEnv('JWT_REFRESH_SECRET', isProduction ? undefined : 'dev-refresh-secret-change-in-production'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },

  upload: {
    driver: process.env.UPLOAD_DRIVER || 'local',
    localPath: process.env.UPLOAD_LOCAL_PATH || './uploads',
    s3: {
      bucketName: process.env.S3_BUCKET_NAME,
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      endpoint: process.env.S3_ENDPOINT,
      publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
    },
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    fromEmail: process.env.SMTP_FROM_EMAIL,
    adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '600000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '500', 10),
  },

  admin: {
    seedEmail: requireEnv('ADMIN_SEED_EMAIL', isProduction ? undefined : 'admin@talukder-furniture.com'),
    seedPassword: requireEnv('ADMIN_SEED_PASSWORD', isProduction ? undefined : 'Admin@123456'),
  },
};

export default config;

