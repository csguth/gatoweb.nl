/**
 * Class representing run of a test step.
 *
 * Each step has 4 related entities:
 * 1. pickle step -> how it is defined in Gherkin
 * 2. pwStep -> TestStep in Playwright test results (will be missing, if step didn't run)
 * 3. bddDataStep -> step info from bddData attachment (will be missing if step didn't run)
 * 4. messages.TestStep -> step info as a Cucumber message inside Cucumber's TestCase
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { TestCaseRun } from './TestCaseRun';
export type TestStepRunEnvelope = Pick<messages.Envelope, 'testStepStarted' | 'testStepFinished' | 'attachment'>;
/**
 * Run of messages.TestStep from hook or scenario.
 */
export declare class TestStepRun {
    protected testCaseRun: TestCaseRun;
    protected testStep: messages.TestStep;
    protected pwStep: pw.TestStep | undefined;
    constructor(testCaseRun: TestCaseRun, testStep: messages.TestStep, pwStep: pw.TestStep | undefined);
    buildMessages(): TestStepRunEnvelope[];
    private isHook;
    private wasExecuted;
    private get startTime();
    private get duration();
    private buildTestStepStarted;
    private buildTestStepFinished;
    private getStatus;
    private getStepError;
}
//# sourceMappingURL=TestStepRun.d.ts.map