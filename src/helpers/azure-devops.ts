/**
 * Azure DevOps integration helpers
 * Provides functionality to interact with Azure DevOps Test Cases and Test Plans
 */

export interface TestCaseResult {
  testCaseId: string;
  outcome: 'Passed' | 'Failed' | 'Blocked' | 'Not Executed';
  comment?: string;
  duration?: number;
  errorMessage?: string;
  stackTrace?: string;
  attachments?: string[];
}

export interface TestCase {
  id: string;
  title: string;
  priority: number;
  tags: string[];
  steps: TestStep[];
}

export interface TestStep {
  action: string;
  expectedResult: string;
  attachments?: string[];
}

/**
 * Azure DevOps API client for test case management
 */
export class AzureDevOpsClient {
  private baseUrl: string;
  private pat: string;
  private organization: string;
  private project: string;

  constructor() {
    this.organization = process.env.AZURE_DEVOPS_ORG || '';
    this.project = process.env.AZURE_DEVOPS_PROJECT || '';
    this.pat = process.env.AZURE_DEVOPS_PAT || '';
    this.baseUrl = `https://dev.azure.com/${this.organization}/${this.project}`;
  }

  /**
   * Update test case result in Azure DevOps
   */
  async updateTestCaseResult(result: TestCaseResult): Promise<boolean> {
    try {
      // This is a placeholder implementation
      // In a real scenario, you would use azure-devops-node-api package
      console.log(`Updating Test Case ${result.testCaseId}:`);
      console.log(`  Outcome: ${result.outcome}`);
      console.log(`  Comment: ${result.comment || 'No comment'}`);
      console.log(`  Duration: ${result.duration || 0}ms`);

      if (result.errorMessage) {
        console.log(`  Error: ${result.errorMessage}`);
      }

      return true;
    } catch (error) {
      console.error(`Failed to update test case ${result.testCaseId}:`, error);
      return false;
    }
  }

  /**
   * Get test case details from Azure DevOps
   */
  async getTestCase(testCaseId: string): Promise<TestCase | null> {
    try {
      // Placeholder implementation
      // In real scenario, fetch from Azure DevOps REST API
      return {
        id: testCaseId,
        title: `Test Case ${testCaseId}`,
        priority: 2,
        tags: ['automation', 'e2e'],
        steps: [
          {
            action: 'Navigate to application',
            expectedResult: 'Application loads successfully',
          },
          {
            action: 'Perform test action',
            expectedResult: 'Expected behavior occurs',
          },
        ],
      };
    } catch (error) {
      console.error(`Failed to fetch test case ${testCaseId}:`, error);
      return null;
    }
  }

  /**
   * Create test run in Azure DevOps
   */
  async createTestRun(testCases: string[], runName?: string): Promise<string> {
    try {
      const runId = `run_${Date.now()}`;
      console.log(`Created test run: ${runId}`);
      console.log(`Test cases: ${testCases.join(', ')}`);
      console.log(`Run name: ${runName || 'Automated Test Run'}`);

      return runId;
    } catch (error) {
      console.error('Failed to create test run:', error);
      throw error;
    }
  }

  /**
   * Complete test run in Azure DevOps
   */
  async completeTestRun(runId: string): Promise<boolean> {
    try {
      console.log(`Completed test run: ${runId}`);
      return true;
    } catch (error) {
      console.error(`Failed to complete test run ${runId}:`, error);
      return false;
    }
  }
}

/**
 * Decorator for Playwright tests to integrate with Azure DevOps
 */
export function azureTestCase(testCaseId: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const client = new AzureDevOpsClient();
      const startTime = Date.now();

      try {
        // Execute the test
        const result = await method.apply(this, args);

        // Report success to Azure DevOps
        await client.updateTestCaseResult({
          testCaseId,
          outcome: 'Passed',
          duration: Date.now() - startTime,
          comment: 'Test executed successfully via Playwright automation',
        });

        return result;
      } catch (error) {
        // Report failure to Azure DevOps
        await client.updateTestCaseResult({
          testCaseId,
          outcome: 'Failed',
          duration: Date.now() - startTime,
          comment: 'Test failed via Playwright automation',
          errorMessage: error instanceof Error ? error.message : String(error),
          stackTrace: error instanceof Error ? error.stack : undefined,
        });

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Helper function to generate test case reports
 */
export function generateTestReport(results: TestCaseResult[]): string {
  const passed = results.filter(r => r.outcome === 'Passed').length;
  const failed = results.filter(r => r.outcome === 'Failed').length;
  const blocked = results.filter(r => r.outcome === 'Blocked').length;
  const notExecuted = results.filter(r => r.outcome === 'Not Executed').length;

  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  return `
# Test Execution Report

## Summary
- **Total Tests**: ${results.length}
- **Passed**: ${passed}
- **Failed**: ${failed}
- **Blocked**: ${blocked}
- **Not Executed**: ${notExecuted}
- **Total Duration**: ${totalDuration}ms

## Test Results
${results
  .map(
    r => `
### ${r.testCaseId} - ${r.outcome}
${r.comment ? `**Comment**: ${r.comment}` : ''}
${r.duration ? `**Duration**: ${r.duration}ms` : ''}
${r.errorMessage ? `**Error**: ${r.errorMessage}` : ''}
`
  )
  .join('\n')}
`;
}
