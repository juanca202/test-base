import { chromium, FullConfig } from '@playwright/test';
import dotenv from 'dotenv';

async function globalSetup(_config: FullConfig) {
  // Load environment variables
  dotenv.config();

  console.log('🚀 Global setup started...');

  // You can add global setup logic here, such as:
  // - Database seeding
  // - Starting external services
  // - Authentication setup
  // - Test data preparation

  // Example: Setup authentication state
  if (process.env.SETUP_AUTH === 'true') {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Perform login and save auth state
    await page.goto(process.env.BASE_URL || 'http://localhost:3000');
    // Add your authentication logic here

    await page.context().storageState({ path: 'tests/setup/auth.json' });
    await browser.close();
  }

  console.log('✅ Global setup completed');
}

export default globalSetup;
