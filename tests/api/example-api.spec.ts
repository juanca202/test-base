import { test, expect } from '@playwright/test';
import { ApiHelpers } from '../utils/test-helpers';

test.describe('Example API Tests', () => {
  test('should get user data from API', async ({ request }) => {
    // Example API GET request
    const response = await request.get('/api/users/1');

    // Verify response status
    expect(response.status()).toBe(200);

    // Parse response JSON
    const userData = await response.json();

    // Validate response structure
    ApiHelpers.validateApiResponse(userData, {
      id: expect.any(Number),
      name: expect.any(String),
      email: expect.any(String),
    });

    // Verify specific data
    expect(userData.id).toBe(1);
    expect(userData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('should create user via API', async ({ request }) => {
    // Example API POST request
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser123',
    };

    const response = await request.post('/api/users', {
      data: newUser,
    });

    // Verify creation response
    expect(response.status()).toBe(201);

    const createdUser = await response.json();

    // Validate created user data
    expect(createdUser.name).toBe(newUser.name);
    expect(createdUser.email).toBe(newUser.email);
    expect(createdUser.id).toBeDefined();
  });

  test('should handle API authentication', async ({ request }) => {
    // Example authenticated API request
    const authToken = process.env.API_TOKEN || 'test-token';

    const response = await request.get('/api/protected-endpoint', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    // Should succeed with valid token
    expect(response.status()).toBe(200);

    // Test without authentication
    const unauthorizedResponse = await request.get('/api/protected-endpoint');
    expect(unauthorizedResponse.status()).toBe(401);
  });

  test('should validate API error responses', async ({ request }) => {
    // Test invalid user ID
    const response = await request.get('/api/users/999999');

    expect(response.status()).toBe(404);

    const errorResponse = await response.json();
    expect(errorResponse).toHaveProperty('error');
    expect(errorResponse.error).toContain('not found');
  });

  test('should handle API rate limiting', async ({ request }) => {
    // Example rate limiting test
    const requests = [];

    // Make multiple rapid requests
    for (let i = 0; i < 10; i++) {
      requests.push(request.get('/api/users'));
    }

    const responses = await Promise.all(requests);

    // Check if any requests were rate limited
    const rateLimited = responses.some(response => response.status() === 429);

    if (rateLimited) {
      console.log('Rate limiting detected - this is expected behavior');
    }

    // Verify at least some requests succeeded
    const successful = responses.filter(response => response.status() === 200);
    expect(successful.length).toBeGreaterThan(0);
  });
});
