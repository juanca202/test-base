import dotenv from 'dotenv';

dotenv.config({ quiet: true });

/**
 * Credentials of the BAW test account, read from the environment.
 */
export interface BawCredentials {
  username: string;
  password: string;
}

/**
 * Read a required environment variable, failing explicitly when it is missing.
 * @param name - Environment variable name.
 * @returns The variable value.
 * @throws Error when the variable is not defined or empty.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Define it in .env (see .env.example).`
    );
  }
  return value;
}

/**
 * Credentials of the BAW test account (`TEST_USER_NAME` / `TEST_USER_PASSWORD`).
 * @throws Error when either variable is missing.
 */
export function getBawCredentials(): BawCredentials {
  return {
    username: requireEnv('TEST_USER_NAME'),
    password: requireEnv('TEST_USER_PASSWORD'),
  };
}

/**
 * Build the value of an HTTP `Authorization: Basic` header.
 * @param credentials - Account credentials.
 */
export function toBasicAuthHeader(credentials: BawCredentials): string {
  const encoded = Buffer.from(
    `${credentials.username}:${credentials.password}`
  ).toString('base64');
  return `Basic ${encoded}`;
}
