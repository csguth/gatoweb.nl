/**
 * Maps attachments to test steps.
 *
 * UPDATE:
 * Since pw 1.50 each step has 'attahcments' field.
 * See: https://playwright.dev/docs/next/api/class-teststep#test-step-attachments
 * See: https://github.com/microsoft/playwright/pull/34037
 * Items in step.attachments are referencially equal to result.attachments:
 * See: https://github.com/microsoft/playwright/pull/34037/files#diff-a99c58caa6261e2a4ea9b74b160d863e627fcb76f171c7bada90eb2065fa6af6R708
 * So this module could compare attachments by reference.
 * Note that 'testInfo.attach()' and 'testInfo.attachments.push()' behave differently:
 * - testInfo.attach() creates extra step with category: 'attach' and puts attachment inside
 * - testInfo.attachments.push() puts attachment directly to step.attachments
 *
 * PREVIOUS:
 * As there is no built-in method to map attachments with steps,
 * I've considered several approaches:
 *
 * 1. Track attachments count in onStepBegin/onStepEnd.
 * + intuitive and simple
 * - does not work in merge-reports, there attachments are populated only in onTestEnd.
 * See: https://github.com/microsoft/playwright/issues/29323
 *
 * 2. Track attachments manually in own code and store attachment indexes
 * for each step in __bddData system attachment.
 * + works in merge-reports
 * - impossible to map attachments in user's custom fixtures, as we don't wrap this code
 *
 * 3. Check Playwright steps with category: 'attach', extract attachment names and
 * map to attachments using names and order.
 * + works in merge-reports
 * + allows to map attachments in custom fixtures
 * - needs Playwright >= 1.34
 *
 * This class implements approach 3.
 *
 * Example:
 *
 * Code:
 * // fixture that creates 3 attachments
 * myFixture: ({}, use, testInfo) => {
 *   await testInfo.attach('my attachment', { body: 'foo' });
 *   await test.step('my step', async () => {
 *     await testInfo.attach('my attachment', { body: 'bar' })
 *   });
 *   await testInfo.attach('my attachment', { body: 'baz' });
 * }
 *
 * Attachments:
 *  my attachment, body = foo
 *  my attachment, body = bar
 *  my attachment, body = baz
 *
 * Steps tree:
 * - fixture: myFixture
 *   - attach "my attachment"
 *   - my step
 *     - attach "my attachment"
 *   - attach "my attachment"
 *
 * Algorithm:
 * 1. find all steps with category: 'attach' using deep-first search traversal
 * 2. iterate these steps in the following manner:
 *   2.1 take step and extract attachment name from step title
 *   2.2 find this attachment by name in result.attachments, searching from the beginning of array
 *   2.3 map found attachment with step.parent
 *   2.4 remove found attachment from attachments array
 */
import * as pw from '@playwright/test/reporter';
export declare class AttachmentMapper {
    private result;
    private allAttachments;
    private stepAttachments;
    constructor(result: pw.TestResult);
    private getStdioAttachments;
    getStepAttachments(pwStep: pw.TestStep): {
        name: string;
        contentType: string;
        path?: string;
        body?: Buffer;
    }[];
    populateStepAttachments(pwStep: pw.TestStep, { fromHook }?: {
        fromHook?: boolean | undefined;
    }): {
        name: string;
        contentType: string;
        path?: string;
        body?: Buffer;
    }[];
    hasUnprocessedAttachments(): boolean;
    mapUnprocessedAttachments(pwStep: pw.TestStep): void;
    private populateByAttachmentsField;
    private populateByAttachCategory;
    private assignAttachment;
}
//# sourceMappingURL=AttachmentMapper.d.ts.map