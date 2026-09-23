/**
 * Test data fixtures for different environments and test scenarios
 */

export interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface ApiEndpoints {
  baseUrl: string;
  users: string;
  auth: string;
  products: string;
}

/**
 * Generate random user data for testing
 */
export function generateRandomUser(): UserData {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);

  return {
    email: `test.user.${timestamp}@example.com`,
    password: 'TestPassword123!',
    firstName: `TestFirst${randomString}`,
    lastName: `TestLast${randomString}`,
    username: `testuser${timestamp}`,
  };
}

/**
 * Predefined test users for different scenarios
 */
export const TestUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'AdminPass123!',
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
  },
  standardUser: {
    email: 'user@example.com',
    password: 'UserPass123!',
    firstName: 'Standard',
    lastName: 'User',
    username: 'standarduser',
  },
  readonly: {
    email: 'readonly@example.com',
    password: 'ReadPass123!',
    firstName: 'ReadOnly',
    lastName: 'User',
    username: 'readonly',
  },
};

/**
 * API Endpoints for different environments
 */
export const ApiConfig = {
  dev: {
    baseUrl: 'https://api-dev.example.com',
    users: '/api/v1/users',
    auth: '/api/v1/auth',
    products: '/api/v1/products',
  },
  staging: {
    baseUrl: 'https://api-staging.example.com',
    users: '/api/v1/users',
    auth: '/api/v1/auth',
    products: '/api/v1/products',
  },
  production: {
    baseUrl: 'https://api.example.com',
    users: '/api/v1/users',
    auth: '/api/v1/auth',
    products: '/api/v1/products',
  },
};

/**
 * Test data for form testing
 */
export const FormTestData = {
  validContact: {
    name: 'Test Contact',
    email: 'contact@example.com',
    phone: '+1234567890',
    message: 'This is a test message for contact form validation.',
  },
  invalidEmails: [
    'invalid-email',
    '@example.com',
    'test@',
    'test..email@example.com',
    'test@example..com',
  ],
  invalidPhones: ['123', 'abc123', '++1234567890', '12345678901234567890'],
};

/**
 * Browser and device configurations
 */
export const BrowserConfigs = {
  desktop: {
    viewport: { width: 1920, height: 1080 },
  },
  tablet: {
    viewport: { width: 768, height: 1024 },
  },
  mobile: {
    viewport: { width: 375, height: 667 },
  },
};

/**
 * Test environment configuration
 */
export function getEnvironmentConfig() {
  const env = process.env.TEST_ENV || 'dev';

  return {
    environment: env,
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    apiBaseUrl: process.env.API_BASE_URL || ApiConfig.dev.baseUrl,
    timeout: parseInt(process.env.TIMEOUT || '30000'),
    headless: process.env.HEADLESS === 'true',
    browser: process.env.BROWSER || 'chromium',
  };
}
