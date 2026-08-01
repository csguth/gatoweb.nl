/**
 * Guess import test from by used steps.
 */
import { TestTypeCommon } from '../playwright/types';
import { StepDefinition } from '../steps/stepDefinition';
import { ImportTestFrom } from './formatter';
export declare class ImportTestGuesser {
    private featureUri;
    private usedStepDefinitions;
    private usedDecoratorFixtures;
    private customTestsSet;
    constructor(featureUri: string, usedStepDefinitions: Set<StepDefinition>, usedDecoratorFixtures: Set<string>, customTestsFromHooks: Set<TestTypeCommon>);
    guess(): ImportTestFrom | undefined;
    private fillCustomTestsFromRegularSteps;
    private fillCustomTestsFromDecoratorSteps;
    private hasCustomTests;
    private findTopmostTest;
    private getExportedTestInfo;
    private throwCantGuessError;
}
//# sourceMappingURL=importTest.d.ts.map