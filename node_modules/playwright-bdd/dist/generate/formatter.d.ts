/**
 * Helper to format Playwright test file.
 */
import { PickleStepArgument } from '@cucumber/messages';
import { BDDConfig } from '../config/types';
import { ScenarioHookType } from '../hooks/scenario';
import { WorkerHookType } from '../hooks/worker';
import { SpecialTags } from './specialTags';
type StepFixtureName = 'Given' | 'When' | 'Then' | 'And' | 'But';
export type ImportTestFrom = {
    file: string;
    varName?: string;
};
export declare class Formatter {
    private config;
    private fixtureOptions;
    constructor(config: BDDConfig);
    fileHeader(featureUri: string, importTestFrom?: ImportTestFrom): string[];
    describe(title: string, specialTags: SpecialTags, children: string[]): string[];
    beforeEach(title: string, fixtures: Set<string>, children: string[]): string[];
    scenarioHooksCall(type: ScenarioHookType, fixturesNames: Set<string>): string[];
    workerHooksCall(type: WorkerHookType, fixturesNames: Set<string>, bddDataVar: string): string[];
    test(title: string, tags: string[], specialTags: SpecialTags, fixtures: Set<string>, pickleId: string, children: string[]): string[];
    step(keywordEng: StepFixtureName, stepText: string, argument: PickleStepArgument | undefined, fixtureNames: Set<string>, pickleStepIds: string[]): string;
    /**
     * Renders test.use() call with fixtures.
     *
     * NOTE: don't generate worker-scoped fixtures in test file,
     * because it forces new worker creation.
     * See: https://github.com/microsoft/playwright/issues/33316
     */
    testUse(lines: string[]): string[];
    worldFixture(worldFixtureName: string): string[];
    testFixture(): string[];
    uriFixture(featureUri: string): string[];
    pageFixtureWithPromptAttachment(): string[];
    private withSubFunction;
    private describeConfigure;
    private wrapInAnonymousDescribe;
    private markAsFailing;
    private testTags;
    /**
     * Apply this function only to string literals (mostly titles here).
     * Objects and arrays are handled with JSON.stringify,
     * b/c object keys can't be in backticks.
     * See: https://stackoverflow.com/questions/33194138/template-string-as-object-property-name
     */
    private quoted;
}
export declare function indent(value: string): string;
export declare function extractPickleIdFromLine(line: string): {
    pickleId: string;
    index: number | undefined;
} | undefined;
/**
 * Extracts pickle step IDs from the comment at the end of the line.
 * Note:
 * - we can't use line.endsWith(`// step: ${gherkinStep.id}`), because for Scenario Outline
 * the same step is rendered multiple times with different pickle step ids.
 * - we can't use line.endsWith(`// step: ${pickleStep.id}`), because for Background
 * the same step is referenced by multiple pickle steps.
 */
export declare function extractPickleStepIdsFromLine(line: string): {
    pickleStepIds: string[];
    index: number | undefined;
} | undefined;
export {};
//# sourceMappingURL=formatter.d.ts.map