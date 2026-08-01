/**
 * Builds particular cucumber testCase.
 * One testCase can have multiple runs, because of retries.
 *
 * About hooks:
 * There are many fixtures that wrap each test, they are actually hooks.
 * How to decide which should be added to the Cucumber report as hooks?
 * There are 3 rules of adding:
 * 1. if hook has a name
 * 2. if hook has attachments
 * 3. if hook has an error
 */
import * as messages from '@cucumber/messages';
import { TestCaseRun } from './TestCaseRun';
import { Hook, HooksGroup } from './Hook';
import { GherkinDocumentWithPickles, PickleWithLocation } from '../../../gherkin/types';
import { ProjectInfo } from './Projects';
type HookWithStep = {
    hook: Hook;
    testStep: messages.TestStep;
};
export declare class TestCase {
    #private;
    id: string;
    private gherkinDocuments;
    private testRunStartedId;
    private beforeHooks;
    private afterHooks;
    private steps;
    constructor(id: string, gherkinDocuments: GherkinDocumentWithPickles[], testRunStartedId: string);
    get projectInfo(): ProjectInfo;
    get pickle(): PickleWithLocation;
    addRun(testCaseRun: TestCaseRun): void;
    getHooks(hookType: HooksGroup): Map<string, HookWithStep>;
    getSteps(): messages.TestStep[];
    buildMessage(): {
        testCase: messages.TestCase;
    };
    /**
     * We collect hooks from all runs of this test case, avoiding duplicates.
     */
    private addHooks;
    /**
     * Initially create steps from pickle steps, with empty stepMatchArgumentsLists.
     */
    private createStepsFromPickle;
    /**
     * Fill stepMatchArgumentsLists from all test retries.
     * It allows to fill as many steps as possible.
     * Possibly, we write the same stepMatchArgumentsLists several times,
     * looks like it's not a problem as they should be equal for all retries.
     */
    private addStepsArgumentsLists;
    private findPickle;
}
export {};
//# sourceMappingURL=TestCase.d.ts.map