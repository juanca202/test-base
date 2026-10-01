# Implementation Plan - DTG-022 Report for US-001

## Overview

Generate a DTG-022 (Pantallas de soporte) report for US-001 (Autenticación y acceso al portal) according to the DTG-022 process defined in the generate-report skill. This involves extracting test evidence from Playwright reports and creating comprehensive documentation with screenshots, videos, and traces.

## Prerequisites Verification

- [x] Playwright report exists at `/Users/juanca202/Documents/repos/test-base/playwright-report/index.html`
- [x] US-001 test cases documented in `/Users/juanca202/Documents/repos/test-base/docs/specs/changes/user-stories/US-001-autenticacion-acceso-portal/test-cases/README.md`
- [x] Template available at `/Users/juanca202/Documents/repos/test-base/docs/templates/DTG022-pantallas-de-soporte.md`
- [x] Ready TCs for US-001: TC-001 through TC-014 (mixed API Test / E2E / Visual Test types)

## Implementation Steps

- [ ] 1. **Verify Playwright report validity and extract embedded data**
      Check that playwright-report/index.html contains the base64-encoded zip data in `<script id="playwrightReportBase64">`.
      Files: /Users/juanca202/Documents/repos/test-base/playwright-report/index.html
      Verify: Confirm the script tag exists and contains data:application/zip;base64 content.

- [ ] 2. **Create temporary extraction script for report data**
      Build a Node.js script in a scratchpad directory (not committed) to decode the base64 zip and read the report.json and individual test files.
      Files: /Users/juanca202/Documents/repos/test-base/.scratchpad/extract-report.js (temporary, not committed)
      Verify: Script successfully extracts and parses report.json, identifies files[] array with fileName and fileId.

- [ ] 3. **Extract test results and associate with US-001 TCs**
      Parse individual {fileId}.json files to get tests[] with titles starting 'TC-XXX:', projectName, outcome, and attachments. Filter for US-001 tests by path pattern (.../us-001/tc-XXX-...) and title prefix.
      Files: /Users/juanca202/Documents/repos/test-base/.scratchpad/extract-report.js (updated)
      Verify: Script correctly identifies all US-001 test cases (TC-001 through TC-014) and their evidence.

- [ ] 4. **Enumerate Ready TCs from US-001 test cases documentation**
      Read and parse the test cases README to create a complete list of Ready TCs with their types (API Test / E2E / Visual Test).
      Files: /Users/juanca202/Documents/repos/test-base/docs/specs/changes/user-stories/US-001-autenticacion-acceso-portal/test-cases/README.md
      Verify: Complete mapping of TC-001 through TC-014 with correct types and priorities identified.

- [ ] 5. **Create evidence directory structure and copy attachments**
      Set up the target directory structure at `/Users/juanca202/Documents/repos/test-base/docs/reports/evidencias/DTG022-SRS-001-30-9-2026/US-001/TC-XXX/` and copy evidence files with readable names.
      Files: /Users/juanca202/Documents/repos/test-base/docs/reports/evidencias/DTG022-SRS-001-30-9-2026/ (directory structure)
      Verify: Evidence files copied with proper naming convention ({proyecto}-screenshot.png, {proyecto}-video.webm, etc.) and no sensitive data exposed.

- [ ] 6. **Generate platform/type mapping for web testing**
      Map Playwright projectName values to the web equivalent replacing Android/iOS patterns (e.g., 'chromium · E2E', 'Mobile Chrome · E2E', 'api-tests · API').
      Files: /Users/juanca202/Documents/repos/test-base/.scratchpad/platform-mapper.js
      Verify: Correct mapping of all project names found in test results to appropriate platform/type descriptions.

- [ ] 7. **Assemble DTG-022 report from template**
      Copy the template and fill in header information, index table with platform mappings, and per-TC sections with evidence tables and links.
      Files: /Users/juanca202/Documents/repos/test-base/docs/reports/DTG022-SRS-001-30-9-2026.md
      Verify: Report contains proper header (DTG022, Pantallas de soporte, SRS-001, 30-9-2026), complete index table, and US-001 section with all TC evidence.

- [ ] 8. **Create per-TC evidence sections with proper formatting**
      For each TC, create a section with project/result/duration/evidence table, embed screenshots as images, link videos/traces/requests, and include error messages for failures.
      Files: /Users/juanca202/Documents/repos/test-base/docs/reports/DTG022-SRS-001-30-9-2026.md (updated)
      Verify: All TCs documented with evidence or "Sin evidencia: {estado}" for missing attachments, relative links work correctly.

- [ ] 9. **Validate report completeness and link integrity**
      Check that every Ready TC from US-001 appears in the report, all relative links resolve to existing evidence files, and report metadata is complete.
      Files: /Users/juanca202/Documents/repos/test-base/docs/reports/DTG022-SRS-001-30-9-2026.md
      Verify: Run link validation to ensure all evidence paths exist, confirm all 14 Ready TCs are documented, report shows correct startTime/run date.

- [ ] 10. **Clean up temporary files and finalize deliverables**
      Remove scratchpad scripts and ensure only the final report and evidence directories remain.
      Files: Remove /Users/juanca202/Documents/repos/test-base/.scratchpad/ directory contents
      Verify: Only final deliverables remain: DTG022-SRS-001-30-9-2026.md and evidencias/DTG022-SRS-001-30-9-2026/ directory with organized evidence.

## Key Implementation Details

### Test Case Coverage (from US-001 README)

- TC-001: Login credenciales válidas (API Test, E2E) - Ready, Alta
- TC-002: Acceso sin sesión redirige (E2E) - Ready, Alta
- TC-003: Login credenciales inválidas (API Test, E2E) - Ready, Alta
- TC-004: Petición autenticada HTTPS CSRF (API Test) - Ready, Alta
- TC-005: Petición sin CSRF token (API Test) - Ready, Alta
- TC-006: Cierre sesión menú lateral (E2E) - Ready, Media
- TC-007: Sesión expira durante formulario (E2E) - Ready, Alta
- TC-008: Acceso directo URL sesión inválida (E2E) - Ready, Alta
- TC-009: BAW inaccesible en login (E2E) - Ready, Media
- TC-011: Layout escritorio navegación (Visual Test) - Ready, Media
- TC-012: Layout tablet navegación (Visual Test) - Ready, Media
- TC-013: Layout móvil menú hamburguesa (Visual Test) - Ready, Media
- TC-014: Breakpoints 768-1280 límite (Visual Test) - Ready, Baja

### Evidence Extraction Process

1. Decode base64 zip from playwright-report/index.html `<script id="playwrightReportBase64">`
2. Read report.json for files[] mapping (fileName → fileId)
3. Parse {fileId}.json files for tests[] with TC associations
4. Copy attachments from playwright-report/data/ to organized evidence structure
5. Filter by US-001 path patterns and TC-XXX: title prefixes

### Platform Mapping (Web Context)

- Replace Android/iOS template rows with web project mappings:
  - chromium → "chromium · E2E"
  - firefox → "firefox · E2E"
  - webkit → "webkit · E2E"
  - Mobile Chrome → "Mobile Chrome · E2E"
  - Mobile Safari → "Mobile Safari · E2E"
  - api-tests → "api-tests · API"
  - Visual tests → "{project} · Visual"

### Security Considerations

- Skip copying any unmasked tokens or Authorization headers
- Flag and warn about sensitive data if found unmasked
- Preserve error context without exposing credentials

### Verification Checklist for Implementation

- [ ] All 14 Ready TCs from US-001 appear in report (with evidence or "Sin evidencia")
- [ ] All relative links resolve to files that actually exist under evidencias folder
- [ ] Report shows correct startTime/run date from Playwright execution
- [ ] No sensitive authentication data leaked in evidence files
- [ ] Platform mappings correctly reflect web testing context (no Android/iOS)
- [ ] Screenshots embedded as images, other evidence as relative links
- [ ] Error messages included for failed tests with trace links
- [ ] Evidence directory structure follows naming convention exactly
