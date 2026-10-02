import { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Global teardown started...');

  // Add global cleanup logic here, such as:
  // - Stopping external services
  // - Cleaning up test data
  // - Generating final reports

  console.log('✅ Global teardown completed');
}

export default globalTeardown;
