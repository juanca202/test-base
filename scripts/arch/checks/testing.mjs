#!/usr/bin/env node
// =============================================================================
// Fitness functions del estándar Testing Standards — checks/testing.mjs
// -----------------------------------------------------------------------------
// UN archivo por ESTÁNDAR. La trazabilidad al criterio va en cada chequeo:
// CR-XXX en la línea de protocolo y un comentario junto al chequeo.
// =============================================================================
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { colorStatus } from '../lib/colors.mjs';

const STANDARD = 'testing';
const require = createRequire(import.meta.url);
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');

let blockingFailures = 0;

function check(cr, enfoque, descripcion, fn) {
  try {
    fn();
    console.log(`${colorStatus('PASS')} ${STANDARD}/${cr} — ${descripcion}`);
  } catch (err) {
    const status = enfoque === 'warning' ? 'WARN' : 'FAIL';
    if (status === 'FAIL') blockingFailures += 1;
    console.log(`${colorStatus(status)} ${STANDARD}/${cr} — ${descripcion}`);
    const detail = err?.message || '';
    if (detail) {
      console.log(
        detail
          .trim()
          .split('\n')
          .map(line => `     ${line}`)
          .join('\n')
      );
    }
  }
}

const REQUIRED_CLIENTS = [
  'axios',
  'node-fetch',
  'got',
  'graphql-request',
  '@apollo/client',
];

function severity(rule) {
  if (rule === 'error' || rule === 2) return 'error';
  if (Array.isArray(rule) && (rule[0] === 'error' || rule[0] === 2)) return 'error';
  return null;
}

function restrictedNames(rule) {
  const options = Array.isArray(rule) ? rule[1] : undefined;
  const paths = options?.paths;
  if (!Array.isArray(paths)) return [];
  return paths.map(entry => (typeof entry === 'string' ? entry : entry?.name)).filter(Boolean);
}

function coversApiTests(files) {
  const list = Array.isArray(files) ? files : [files];
  return list.some(pattern => typeof pattern === 'string' && pattern.includes('tests/api'));
}

// --- CR-003 (bloqueante) -----------------------------------------------------
// Las pruebas REST y GraphQL DEBEN usar APIRequestContext de Playwright.
// Audita el cableado de ESLint: no-restricted-imports en error sobre tests/api,
// prohibiendo otros clientes HTTP o GraphQL. No ejecuta el linter.
check(
  'CR-003',
  'bloqueante',
  'regla de APIRequestContext obligatoria activa [regla ESLint: no-restricted-imports]',
  () => {
    const config = require(join(repoRoot, 'eslint.config.js'));
    const block = config.find(entry => coversApiTests(entry.files));
    if (!block) {
      throw new Error('No hay un bloque de ESLint para tests/api.');
    }
    const rule = block.rules?.['no-restricted-imports'];
    if (severity(rule) !== 'error') {
      throw new Error('no-restricted-imports no está en severidad error para tests/api.');
    }
    const names = new Set(restrictedNames(rule));
    const missing = REQUIRED_CLIENTS.filter(name => !names.has(name));
    if (missing.length > 0) {
      throw new Error(`Faltan clientes restringidos: ${missing.join(', ')}.`);
    }
  }
);

process.exit(blockingFailures > 0 ? 1 : 0);
