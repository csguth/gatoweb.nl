/**
 * Handles whole test run.
 * See: https://github.com/cucumber/messages/blob/main/messages.md#testrunfinished
 */
import * as messages from '@cucumber/messages';
import * as pw from '@playwright/test/reporter';
export declare class TestRun {
    id: `${string}-${string}-${string}-${string}-${string}`;
    private globalErrors;
    buildTestRunStarted({ startTime }: pw.FullResult): {
        testRunStarted: messages.TestRunStarted;
    };
    buildTestRunFinished({ status, startTime, duration }: pw.FullResult): {
        testRunFinished: messages.TestRunFinished;
    };
    registerGlobalError(error: pw.TestError): void;
}
//# sourceMappingURL=TestRun.d.ts.map