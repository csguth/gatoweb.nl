import { TestInfoError } from '@playwright/test';
/**
 * Get code snippet by the error stack.
 * See: https://github.com/microsoft/playwright/blob/release-1.49/packages/playwright/src/reporters/internalReporter.ts#L115
 *
 * Some downside here is that it's done in a test worker, not in the reporter process.
 */
export declare function getCodeSnippet(error: TestInfoError): string | undefined;
//# sourceMappingURL=snippet.d.ts.map