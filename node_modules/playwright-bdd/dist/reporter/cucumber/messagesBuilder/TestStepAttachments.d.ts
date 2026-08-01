/**
 * Class for getting attachment messages for a particular step.
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { TestCaseRun } from './TestCaseRun';
export declare class TestStepAttachments {
    private testCaseRun;
    private testStep;
    private pwStep?;
    constructor(testCaseRun: TestCaseRun, testStep: messages.TestStep, pwStep?: pw.TestStep | undefined);
    buildMessages(): {
        attachment: messages.Attachment;
    }[];
    private buildAttachmentMessage;
}
//# sourceMappingURL=TestStepAttachments.d.ts.map