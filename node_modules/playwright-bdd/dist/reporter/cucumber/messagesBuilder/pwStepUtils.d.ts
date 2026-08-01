/**
 * Utility functions for filtering Playwright steps.
 */
import * as pw from '@playwright/test/reporter';
import { HooksGroup } from './Hook';
/**
 * Returns root step for Before Hooks / After Hooks.
 * Strings 'Before Hooks' and 'After Hooks' are hardcoded in Playwright.
 * See: https://github.com/microsoft/playwright/blob/release-1.49/packages/playwright/src/worker/workerMain.ts#L336
 */
export declare function getHooksRootPwStep(result: pw.TestResult, type: HooksGroup): pw.TestStep | undefined;
/**
 * Traverse steps tree per shouldEnter fn, starting from root.
 * Returns flat list of steps.
 * Graph traversal is done in BFS manner.
 */
export declare function walkSteps(root: pw.TestStep | pw.TestStep[], shouldEnter?: (pwStep: pw.TestStep) => boolean | void): pw.TestStep[];
/**
 * Finds the deepest step that satisfies predicate function.
 */
export declare function findDeepestStepWith(pwSteps: pw.TestStep[], predicate: (pwStep: pw.TestStep) => boolean | void): pw.TestStep | undefined;
export declare function isUnknownDuration(pwStep: pw.TestStep): boolean;
export declare function findParentWith(pwStep: pw.TestStep, predicate: (pwStep: pw.TestStep) => boolean): pw.TestStep | undefined;
export declare function areTestErrorsEqual(e1: pw.TestError, e2: pw.TestError): boolean;
export declare function isTopLevelStep(pwStep: pw.TestStep): boolean;
/**
 * When calling test.skip() in Playwright test, it throws an error with message:
 * "Test is skipped".
 * This error exists in step, but it is not a real error, it is a skipped step.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/worker/testInfo.ts#L223
 */
export declare function isSkippedError(error?: pw.TestError): boolean;
//# sourceMappingURL=pwStepUtils.d.ts.map