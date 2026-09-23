const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // General rules
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-redeclare': 'error',

      // Test-specific overrides
      '@typescript-eslint/no-non-null-assertion': 'off', // Common in tests
    },
  },
  {
    files: ['tests/**/*', '**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'no-console': 'off', // Allow console in tests
      '@typescript-eslint/no-explicit-any': 'off', // More lenient in tests
      '@typescript-eslint/no-unused-vars': 'off', // More lenient with unused vars in tests
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['tests/api/**/*.{ts,js}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              message:
                'Las pruebas REST y GraphQL deben usar APIRequestContext de Playwright.',
            },
            {
              name: 'node-fetch',
              message:
                'Las pruebas REST y GraphQL deben usar APIRequestContext de Playwright.',
            },
            {
              name: 'got',
              message:
                'Las pruebas REST y GraphQL deben usar APIRequestContext de Playwright.',
            },
            {
              name: 'graphql-request',
              message:
                'Las pruebas REST y GraphQL deben usar APIRequestContext de Playwright.',
            },
            {
              name: '@apollo/client',
              message:
                'Las pruebas REST y GraphQL deben usar APIRequestContext de Playwright.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
    },
  },
];
