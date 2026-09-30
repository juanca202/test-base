import { randomUUID } from 'node:crypto';
import { getBawCredentials } from '../config/env';

/** Pair of credentials that BAW must reject. */
export interface InvalidCredentials {
  /** Human-readable description of what makes the pair invalid. */
  description: string;
  username: string;
  password: string;
}

/** Generate a password that cannot match any real account. */
function buildWrongPassword(): string {
  return `wrong-${randomUUID()}`;
}

/**
 * Credentials that BAW must reject: the existing test account with a wrong
 * password, and an account name that does not exist in BAW.
 * The valid account comes from the environment; nothing is hardcoded.
 */
export function buildInvalidCredentials(): InvalidCredentials[] {
  return [
    {
      description: 'usuario existente con contraseña incorrecta',
      username: getBawCredentials().username,
      password: buildWrongPassword(),
    },
    {
      description: 'usuario inexistente',
      username: `unknown-${randomUUID()}`,
      password: buildWrongPassword(),
    },
  ];
}
