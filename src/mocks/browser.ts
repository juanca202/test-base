import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** Worker de MSW para simular APIs HTTP en el navegador. */
export const worker = setupWorker(...handlers);
