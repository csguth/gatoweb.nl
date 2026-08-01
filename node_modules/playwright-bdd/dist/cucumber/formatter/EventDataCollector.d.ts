/**
 * Groups Cucumber messages for easier access.
 * Based on Cucumber, with some changes due to strictNullChecks errors.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/helpers/event_data_collector.ts
 */
import { EventEmitter } from 'node:events';
import * as messages from '@cucumber/messages';
export interface ITestCaseAttempt {
    attempt: number;
    willBeRetried: boolean;
    gherkinDocument: messages.GherkinDocument;
    pickle: messages.Pickle;
    stepAttachments: Record<string, messages.Attachment[]>;
    stepResults: Record<string, messages.TestStepResult>;
    testCase: messages.TestCase;
    worstTestStepResult: messages.TestStepResult;
}
export default class EventDataCollector {
    private gherkinDocumentMap;
    private pickleMap;
    private testCaseMap;
    private testCaseAttemptDataMap;
    readonly undefinedParameterTypes: messages.UndefinedParameterType[];
    constructor(eventBroadcaster: EventEmitter);
    /**
     * @public
     */
    getGherkinDocument(uri: string): messages.GherkinDocument;
    /**
     * @public
     */
    getPickle(pickleId: string): messages.Pickle;
    getTestCaseAttempts(): ITestCaseAttempt[];
    getTestCaseAttempt(testCaseStartedId: string): ITestCaseAttempt;
    parseEnvelope(envelope: messages.Envelope): void;
    private initTestCaseAttempt;
    storeAttachment(attachment: messages.Attachment): void;
    storeTestStepResult({ testCaseStartedId, testStepId, testStepResult, }: messages.TestStepFinished): void;
    storeTestCaseResult({ testCaseStartedId, willBeRetried }: messages.TestCaseFinished): void;
}
//# sourceMappingURL=EventDataCollector.d.ts.map