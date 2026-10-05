import { createReadStream, createWriteStream } from 'node:fs';
import { createInterface } from 'node:readline/promises';

export interface AskHumanOptions {
  /** Variable de ambiente que, si existe, evita el prompt (útil en CI). */
  envVar?: string;
  /** Tiempo máximo de espera de la persona, en milisegundos. */
  timeoutMs?: number;
}

const TTY_INPUT = process.platform === 'win32' ? 'CON' : '/dev/tty';
const TTY_OUTPUT = process.platform === 'win32' ? 'CON' : '/dev/tty';

/**
 * Pide un dato a la persona que ejecuta la prueba (intervención humana),
 * por ejemplo un OTP.
 *
 * Los workers de Playwright no reciben `process.stdin`, por eso se lee
 * directo de la terminal (`/dev/tty`). Requiere ejecutar la prueba desde
 * una terminal interactiva y con `--workers=1` para no mezclar prompts.
 *
 * Si `envVar` está definida, se usa su valor sin preguntar.
 */
export async function askHuman(
  question: string,
  { envVar, timeoutMs = 120_000 }: AskHumanOptions = {}
): Promise<string> {
  const fromEnv = envVar ? process.env[envVar] : undefined;
  if (fromEnv) return fromEnv;

  if (process.env.CI) {
    throw new Error(
      `Se requiere intervención humana pero se ejecuta en CI. Define ${envVar ?? 'el dato'} o excluye la prueba.`
    );
  }

  let input: ReturnType<typeof createReadStream>;
  let output: ReturnType<typeof createWriteStream>;
  try {
    input = createReadStream(TTY_INPUT);
    output = createWriteStream(TTY_OUTPUT);
  } catch {
    throw new Error('No hay terminal interactiva para pedir el dato.');
  }

  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question(`\n⚠️  ${question}: `, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    return answer.trim();
  } finally {
    rl.close();
    input.destroy();
    output.end();
  }
}
